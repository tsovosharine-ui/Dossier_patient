# Système de notifications infirmiers — Plan d'implémentation

## Objectif

Quand un médecin prescrit un médicament avec une fréquence (ex: toutes les 8h), le système envoie automatiquement des notifications aux infirmiers du service pour qu'ils n'oublient pas de donner le médicament au patient.

---

## Flux complet

```
Médecin valide prescription médicale
  → Médicament : Paracétamol 500mg, toutes les 8h, début 08:00, durée 7 jours
    → Création automatique d'un planning de prises :
        Prise 1 : 08:00
        Prise 2 : 16:00
        Prise 3 : 00:00
        ... jusqu'à confirmation manuelle de l'infirmier
    → À chaque heure prévue :
        → Notification envoyée à TOUS les infirmiers du service
        → Si non lue après 5 min → renvoyer
        → Si non lue après 5 min encore → renvoyer
        → ... jusqu'à lecture
    → Infirmier lit la notification → confirme OU refuse avec motif
    → Si confirmé → prochaine prise planifiée automatiquement
    → Si refusé → prochaine prise planifiée quand même + motif enregistré
    → S'arrête quand l'infirmier arrête manuellement le traitement
```

---

## Ce qui sera créé

### Backend

#### 1. Nouveaux champs dans `Medicament` (Prisma)

```prisma
intervalleMinutes  Int?
dureeJours         Int?
dateDebutEffective DateTime?
planningActif      Boolean @default(true)
```

#### 2. Nouvelle table `PriseMedicament`

```prisma
model PriseMedicament {
  id              String    @id @default(uuid())
  medicamentId    String
  prescriptionId  String
  patientId       String
  heurePrevue     DateTime
  statut          String    @default("EN_ATTENTE")
  motifRefus      String?
  confirmeAt      DateTime?
  notifEnvoyeeAt  DateTime?
  tentatives      Int       @default(0)
  createdAt       DateTime  @default(now())
}
```

**Statuts possibles :** `EN_ATTENTE` | `NOTIFIE` | `CONFIRME` | `REFUSE`

#### 3. `PlanningService` — génération des prises

Parse automatiquement le texte fréquence → `intervalleMinutes` :

| Texte fréquence | Intervalle |
|---|---|
| `"1× par jour"` | 1440 min |
| `"2× par jour (toutes les 12h)"` | 720 min |
| `"3× par jour (toutes les 8h)"` | 480 min |
| `"4× par jour (toutes les 6h)"` | 360 min |
| `"Toutes les 4h"` | 240 min |
| `"En continu (perfusion)"` | pas de planning |
| `"Si besoin (SOS)"` | pas de planning |
| `"Dose unique"` | une seule prise |

#### 4. `PlanningScheduler` — cron toutes les minutes

```
Toutes les minutes :
  1. Cherche toutes les PriseMedicament où :
     - heurePrevue <= maintenant
     - statut = EN_ATTENTE ou NOTIFIE
     - planningActif = true
  2. Pour chaque prise EN_ATTENTE :
     - Envoyer notification WebSocket à service:infirmier
     - statut → NOTIFIE, notifEnvoyeeAt = maintenant
  3. Pour chaque prise NOTIFIE depuis > 5 min :
     - Renvoyer notification (relance)
     - tentatives++
```

#### 5. Nouveaux endpoints

```
POST /prises/:id/confirmer
     → { statut: 'CONFIRME' }
     → crée automatiquement la prise suivante

POST /prises/:id/refuser
     → { motif: string }
     → crée automatiquement la prise suivante

POST /prises/medicament/:medicamentId/arreter
     → planningActif = false (stop toutes les prises)

GET  /prises/patient/:patientId/actives
     → toutes les prises en cours pour un patient
```

#### 6. Format de la notification envoyée

```json
{
  "type": "prise_medicament",
  "titre": "🔔 Donner médicament — RAKOTO Jean-Pierre",
  "contenu": {
    "medicament": "Paracétamol",
    "dose": "500mg",
    "voie": "Orale (per os)",
    "patientId": "363d3eba...",
    "priseMedicamentId": "uuid",
    "heurePrevue": "2026-05-21T08:00:00Z",
    "tentative": 1
  }
}
```

---

## Ce qui NE change PAS

- Le formulaire frontend `MedicaleForm` — on garde les champs texte existants (fréquence, durée, heureDebut)
- Le parsing se fait côté backend automatiquement à la création

---

## Dépendances à installer

```bash
npm install @nestjs/schedule
```

---

## Fichiers à créer/modifier

```
src/
  planning/
    planning.module.ts
    planning.service.ts      ← génération des prises
    planning.scheduler.ts    ← cron toutes les minutes
    planning.controller.ts   ← confirmer/refuser/arrêter
  prisma/schema.prisma       ← ajout PriseMedicament + champs Medicament
  prescription/medicale/
    medicale.service.ts      ← appel PlanningService après création
  app.module.ts              ← import PlanningModule + ScheduleModule
```

---

## Décisions prises

| Question | Décision |
|---|---|
| Parse fréquence | Automatique côté backend depuis le texte |
| Parse durée | Automatique, pas bloquant |
| Plusieurs médicaments | Planning indépendant par médicament |
| Refus infirmier | Possible avec motif obligatoire |
| Destinataires | Tous les infirmiers du service (`service:infirmier`) |
| Arrêt du planning | Manuel par l'infirmier |
| Relance si non lu | Toutes les 5 minutes |
