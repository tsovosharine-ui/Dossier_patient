# PROJET CHU :

**GESTION DES PATIENTS (Entrer jusqu’à la sortie)**

**Principe : Digitalisation du parcours patient — entrée à la sortie . Le Centre Hospitalier Universitaire (CHU) souhaite déployer un Système d'Information Hospitalier (SIH) couvrant l'intégralité du parcours patient, depuis l'accueil jusqu'à la sortie définitive. Ce système doit assurer une traçabilité totale, irréversible et centrée sur le patient de toutes les actions effectuées par tous les acteurs, sur tous les dossiers, à tout moment.**


**Le périmètre est strictement défini : la digitalisation du parcours patient. Cela inclut l'enregistrement, le triage, les consultations, l'hospitalisation, les actes cliniques et para-cliniques, la dispensation médicamenteuse, et la sortie du patient.**

I. **GENERALE :**

1. **Acceuil des patients :  
A l’arrivée du patient à l’hôpital , il passe d’abord par le service d’accueil   
 Les étapes sont les suivantes :   
 \* Arrivée du patient  
 \* Enregistrement des informations du patient (nom , âge ,contact , Date , heure ,etc)  
 \* Attribution d’un identifiant unique (ID patient) pour identifier le patient dans le système.  
 \* Orientation du patient vers le service approprié selon son problème  
Exemple :   
Si le patient dit avoir mal au ventre , l’accueil l’oriente vers le service de gastro-entérologie ou un service correspondant ou juste l’orienter vers un consultation externe si le gastro est inécessaire et c’est seulement après au médecin qui la consulter décide si gastro-entérologie est vraiment nécessaire. **

2. **Gestion des patients dans un service :  
Lorsqu’un patient est envoyé vers un service , ce service reçoit le dossier du patient envoyé par l’accueil.  
 Le service peut alors :   
 \* Refuser le patient :   Le service peut refuser si le patient doit être traité par un autre service plus approprié.  
 Exemple : Un patient envoyé en cardiologie mais qui doit plutôt aller en pneumologie.  
 \* Accepter le patient :  Le service accepte alors de prendre en charge le patient  
 Dans ce cas :   
 - Le personnel médicale consulte le patient , les examens et analyses peuvent êtres réalisés  
 - Exemple : si le patient vient pour faire une analyse médicale , le résultat est directement enregistré dans le dossier du patient.  
 - Sortie de service : Lorsque le patient termine sa prise en charge dans ce service : son dossier est archivé dans ce service , cela permet de garder l’historique médicale du patient  
\* Cas d’un patient déjà enregistré :  
 Si le patient revient plus tard pour une autre maladie et est renvoyé vers un autre service :  
 - Le nouveau service peut consulter l’historique du patient.  
 - Mais l’archive de l’ancien service ne peut être modifiée , supprimée , désarchivée  
        - Après la prise en charge , le patient est archivée aussi dans le nouveau service. Ainsi , un patient peut avoir plusieurs historiques dans différents services.**

3. **Cas particulier :  Achat de médicaments :  
Même si un patient vient uniquement pour acheter des médicaments à la pharmacie , il doit :  
 Passer à l’accueil , être enregistrer , avoir un dossier patient**

4. **Consultation externe :  
L’accueil gère l’organisation des consultations avec les médecins.  
Les actions de l’accueil :  
 \* Recevoir le patient  
 \* Choisir le médecin pour la consultation  
 \* Vérifier si le médecin est présent  
 \* Vérifier si le médecin est disponible  
NB :   
- Chaque médecin possède un quota de patients par jour (exemple : 10 patients par jour)  
- Si le médecin n’est plus disponible :  l’accueil doit proposer un autre rendez-vous au patient selon les disponibilités.**

5. **Gestion des rendez-vous par le médecin :  
Le médecin possède également certaines actions dans le système . Il peut :  
 \* Reporter un rendez-vous : Si le médecin ne peut pas travailler (urgences , absences, problème personnel , …)  
\* Transfert d’un patient : Il peut attribuer son patient à un autre médecin , seulement si ce médecin est son assistant.  
\* Ajouter un rendez-vous : exemple : un patient doit revenir dans 2 jours pour un contrôle médical.  
\*Indiquer son indisponibilité: Le médecin peut informer l’accueil via son interface qu’il n’est plus disponible.**

6. **Transfert d’un patient :  
Le transfert d’un patient peut se faire de deux manières : directement par le médecin , en passant par l’accueil**

7. **Prescription :  
Après la consultation , le médecin peut émettre un prescription pour : Analyse (sang , urine ,etc) , Examens radiologiques(scanner , radiographie,IRM,etc) , médicaments , autres…  
cas particulier : patient venant d’un autre hôpital  
Si un patient provenant d’un autre hôpital vient pour réaliser : un scanner ou tout autre examen . Alors :  
\* L’accueil doit enregistrer le patient  
\* Un dossier patient est créé avec un ID unique  
\* Le patient peut ensuite être orienté vers le service correspondant (radiologie , labo , etc.) pour réaliser l’examen  
\* Un fois l’examen terminé , le résultat est enregistré dans le dossier du patient et peut être remis au patient.**

8. **Accueil vers le service clinique :  
Dans ce service , deux cas existent :  
 \* Cas urgent :  
Le patient est pris en charge immédiatement   
Après l’urgence :  soit le patient est transféré vers un autre service , soit il reste chez lui si aucun traitement supplémentaire n’est nécessaire.  
 \* Cas non urgent :  
Deux disponibilité : Hospitalisation , consultation simple.  
**

**  
II. DÉTAILS DES SERVICES :**

1. **Accueil :  
1**.**1 . Enregistrement, Collecte des informations et Identification Unique :  
 \* Collecte / saisie des données :** Enregistrer les informations du patient (nom, prénom, contact, adresse, etc.).  
\* I**dentifiant unique (ID) :** Générer un ID patient unique et permanent.  
\* **Rôle de l’ID :** point de référence unique pour toutes les interactions (consultation, contrôle, hospitalisation, urgences, achat à la pharmacie) afin de centraliser l’historique médical.  
  
1.2 . **Triage (orientation initiale)  
**Le pôle accueil doit déterminer le parcours adapté dès l’arrivée du patient.  
\* **Analyse du motif :** Identifier la pathologie ou le besoin.  
\* **Parcours possibles : Consultation externe , Hospitalisation(service) , Urgence , Achat de médicaments** (vente à la pharmacie)  
 -- **Parcours : Consultation Externe : **Objectif : orienter le patient vers le bon praticien.  
 \* **Tri par spécialité :** Vérifier la spécialité requise selon la pathologie.  
 \* **Disponibilité :** Vérifier la **disponibilité en temps réel** des médecins.  
 \* **Affectation :** Attribuer le patient au médecin disponible.  
 \* **Prescription :** Le médecin peut produire une ordonnance / prescription.  
 \* **Notification vers la pharmacie :** Transmission de l’ordonnance (ordonnance numérique) pour la dispensation.**  
 Remarque (Contrôle (rendez-vous) et Suivi) : **Pour les patients déjà suivis dans l’établissement :   
- **Vérification de l’historique :** Utiliser l’ID unique pour retrouver le dossier.  
- **Contrôle :** Gestion du contrôle via **rendez-vous**.  
- **Orientation ciblée : -- **Retour vers le médecin traitant pour un suivi de consultation.  
 -- Orientation vers un service spécifique pour un examen technique (laboratoire, imagerie, etc.).  
  
-- **Parcours : Hospitalisation (demande d’admission) :  
         \* Flux :** Accueil → **demande** (création / ouverture d’un **dossier patient** d’hospitalisation).  
         \* **Statut de la demande : Refuser(avec motif) , A voir , Accepter  
                Si Accepter: **Affectation des ressources (ex. **chambre**, **lit**), rattachées à la **prise en charge** (hospitalisation).  
  
1.3 . **Demande d’avis interservices (pendant la prise en charge) :  
             \* Éléments minimum :** service sollicité + motif.  
             \* **Retour :** le service destinataire fournit l’avis et le suivi se poursuit dans le service demandeur.  
  
1.4 . **Sortie / Fin de prise en charge :   
**La fin de prise en charge peut prendre plusieurs formes :  
\* sortie normale (avec compte rendu)  
\* transfert (avec compte rendu) :   
      -- **Transfert : demande de transfert** avec statut :  
                - **Accepter** → clôturer le dossier (compte rendu) → **créer un nouveau dossier** dans le service / établissement receveur  
                - **À voir  
                - Refusé (avec justification)**  
\* évadé ( compte rendu)  
\* décharge ( Engagement du patient , compte rendu)  
\* Décès (compte rendu , actes de décès)    
  
**NB : Catégorisation des Dossiers Patients  
**Tous les dossiers patients doivent être **catégorisés selon leur type de prise en charge**. Cette classification permet d'identifier immédiatement le mode de gestion administrative et financière du patient dès son admission au **Pôle Accueil**.**  
\* Exemples de catégories :** Pivot, Banque, etc.**  
\* Objectif :** Assurer la traçabilité et la cohérence du suivi à travers tous les services (Cliniques, Paracliniques et Pharmacie).

2. ** Prise en charge de la patient :  
Quand le patient venant de l’accueil arrive vers un service ou seulement en consultation , le médecin qui le prend en charge peut faire : observation médicale , prescription , transfert , demande d’avis , sortie  
      2.1 Observation médicale :   
Remarque : Dans l’onglet observation médicale on va mettre tous les observation possible pour tout types de service et après que le médecin ait fini son observation , les observations vides qui sont pour les autres services disparaissent du dossier du patient. (Exemple :  si un patient a mal à la gorge , l’examen neurologique n’est pas nécessaire pour l’observation alors le médecin laissera tous les champs à remplir vide , quand le médecin fini l’observation , dans le dossier observation du patient , l’examen neurologique n’est plus là).  
  
Dans l’observation médicale , il y a : **  
\* **État civil **: Plus besoin de remplir car on l’a déjà rempli à l’accueil ( age:(calculer automatiquement) , adresse , nom , prénom , ; date/lieu de naissance , sexe , contact d’urgence , contact , profession , etc.)  
\* **Motif de consultation  
\* Histoire de la maladie (texte en champ libre)  
\* Antécédent :  
         -- Pour adulte (supérieur ou egal à 15 ans ):  
        - Médicaux personnel (texte)  
        - Chirurgicaux (texte)  
        - Familiaux (texte)  
        - Allergie à (texte)  
        - Gynéco (texte)  
        - Statut vaccinale (Texte)  
        - Mode de vie : (case à cocher : tabac , alcool ; champ libre : autre substance, activité sportive , maison : (petit , combien de la famille , est ce que c’est étroit , utilisation de gaz ou de charbon , etc.)  
  
          -- Pour enfant (inférieur à 15 ans ) ( remarque : celle des enfants sont composés aussi des adultes mais les éléments ci dessous sont un plus ) :  
       -  Grossesse (gestité/parité : terme(SA + Jours))  
       - Suivi de grossesse ( case a cocher : bien suivi , insuffisant , suivi)  
       - Grossesse (pathologie grossesse , autre événement à préciser )  
       -  Accouchement :  
               -- Mode ( césarienne , urgence , programmer)  
               -- Présentation (céphalique , siège , transparence)  
               -- Liquide amniotique (claire , méconial , hémorragique)  
               -- Événement perinataux :  
                           \* Naissance et période néonatale immédiat  
                           \* Taille de naissance (cm)  
                           \* Poids naissance (g) , pc naissance (cm)  
                           \* score d’apgar ( 3 score selon le temps)  
              -- Développement psychomoteur , sensoriel , langage ( champ libre)  
  
\*Traitement en cours :  
(Médicaments , voie , posologie , depuis ) . Le médecin a la possibilité d’en ajouter   
\* Examen physique :  
  - Constante ( vitale et paramètre) :  
         -- Fréquence cardiaque (bpm)  
        -- Fréquence respiratoire (cycle/min)  
        -- TA : Diastolique(mhg) et Systolique(mhg)  
        -- SPO  
        -- Temperature (°C)  
        -- Glycémie capilaire (millimol/l)  
        -- Poids  
        -- Taille longueur (cm)  
        -- IMC (calculer automatiquement)  
        -- TRC (secondes)  
        -- Pour les bébé :   
                   -- Périmètre crânien ( cm)  
                   -- Périmètre bracial (cm)  
\* Etat générale conscient et aspect :  
-- recherche (glasgow) (test sur 15 avec 5 choix de réponse pour chaque questions (3))  
-- Glantyre (0 à 28jours) : champ libre  
  
\* Examen neurologique :  
  -- Abdo , cardio , respiratoire , urinaire , gynécologique , ORL , neurogenitale ( chacun sont constitué de 4 champs libre composés de : Inspection , palpation , percussions , auscultation)  
       Autre spécificité : champ libre  
   -- Neurologique : Tonus musculaire , motricité , réflexe ostéo tendineux , sensibilité , réflexe primitif (néonatale , nourrissant) , coordination et équilibre , nerfs crâniens)  
        Autre à préciser : champ libre  
 -- Dermatologie : Inspection , palpation  
 -- Membre et articulation : champ libre  
  
\* Examen complémentaire (les examens qui sont déjas réaliser) :  
Sous forme de tableau à deux colonnes : Examens et résultats  
\*Diagnostic :  
Le médecin ne doit choisir qu’un parmi les deux :  
       - Diagnostic retenue :  champ libre  
       - Hypothèses de diagnostic : peuvent être plusieurs  
  
Remarque :  
\* Quand le médecin clique sur son patient , le médecin doit voir :   
-- Lit du patient  
-- Nombre de jours d’hospitalisation  
-- observation médicale   
-- Conduite à tenir (CAT) : (traitement en cours , médoc , non médoc , soins , surveillance , -- kiné   
-- historiques prescription  
-- résultat para-cliniques   
 -- Avis   
-- Evolution : (paramètre , état générale , signe fonctionnel , signe physique , conclusion ( par rapport à hier ).**

**\* Dans le dossier patient , il y a : Observation médicale , traitement en cours , historiques prescription , traitement à faire , résultat para-cliniques , surveillance , avis  
2.2 Prescription :   
Il existe 5 sortes de prescription : médicaux(champ libre : peut être plusieurs) , non médicaux (champ libre) , surveillance , para-cliniques(labo(bilan) , imagerie , endoscopie , anatomie , pathologie . Etc…) , transfusion sanguine   
  
\* Transfusion sanguine :   
Prescription transfusion sanguine :   
 -- Renseignement clinique (champs obligatoire)   
-- Antécédent de transfusion (case à cocher oui/non)  
-- Groupage (champs obligatoire)   
-- Hémoglobine (Hb en g/l) (réel positif)   
-- Type de produit sanguin : Sang total , Culot globulaire , Plasma frais-congelé , Plasma riche en plaquette ( PRP) : ▪ Nombre de plaquette en G/l   
-- Quantité (champs libre)   
-- Date prévue Champs libre (pour écrire quelques notes)   
Un Bouton « valider prescription » qui envoie automatiquement la prescription vers le service« dépôt des sangs »  
  
2.3 Demande d’avis interservices (pendant la prise en charge) :  
             \* Éléments minimum : service sollicité + motif.  
             \* Retour : le service destinataire fournit l’avis et le suivi se poursuit dans le service demandeur.  
  
2.4. Sortie / Fin de prise en charge :   
La fin de prise en charge peut prendre plusieurs formes :  
\* sortie normale (avec compte rendu)  
\* transfert (avec compte rendu) :   
      -- Transfert : demande de transfert avec statut :  
                - Accepter → clôturer le dossier (compte rendu) → créer un nouveau dossier dans le service / établissement receveur  
                - À voir  
                - Refusé (avec justification)  
\* évadé ( compte rendu)  
\* décharge ( Engagement du patient , compte rendu)  
\* Décès (compte rendu , actes de décès)  **

3. **Pole Clinique (Hospitalisation & Soins) :  
3.1 Services de Chirurgie / UC & Pédiatrie :  
**Ces services partagent une logique centrée sur l’acte opératoire, adaptée aux adultes (UC / Chirurgie) ou aux enfants (Pédiatrie).**  
 -- Parcours pré-opératoire : **Consultations et visites pré-anesthésiques obligatoires avant l’entrée au bloc.**  
 -- Bloc opératoire : **Gestion du programme opératoire via une **interface bloc**.**  
 -- Sécurité médicamenteuse : **Vérification des médicaments prescrits avant l’intervention.**  
 -- Post-opératoire : **Le chirurgien rédige le compte rendu opératoire et assure le suivi immédiat.**  
 \* Consultation pré-anesthésique (C.P.A) :   
 Prescription chirurgie (demande de CPA) :  
 - ID patient  
 - **Type de chirurgie (champ libre)  
 - Nom du chirurgien  
 - Durée prévue  
 - Risque hémorragique  
 - Bouton **« valider »** : bascule automatiquement la demande vers la **CPA  
 Réalisation de la CPA :  
 Effectuée par le Professeur uniquement.Quand l’utilisateur clique sur la CPA, l’interface doit afficher :  
 -- Dossier complet , demande de CPA(prescription)  
 -- Évaluation anesthésiques :  
         Dans l’évaluation anesthésiques il y a :  
                       \* Antécédent anesthésiques : oui ou non   
                                Si oui (un champ libre pour le décrire) puis il y a  un autre champ qui se montre « incident » en champ libre   
              -- Examen clinique (tous en champ libre) : cardio-vasculaire , pulmonaire , neurologique ,  coloration conjonctivale , fréquence cardiaque , TA : systolique et diastolique  
             -- **Évaluation des voies aériennes : ouverture buccale (champ libre) , mallampatie (score ( 1,2,3)) , DMTC (champ libre)  
             -- Score ASA : score choix de 1 à 6 + ASAE(urgence)  
             -- Décision d’aptitude : \* Apte : Date maintenue , Date à voir  
                                                   \* Contre indication à reporter et absolue  
            -- Protocole anesthésiques : \* Type d’anesthésie prévue (Champ libre)  
                                                          \* Technique d’intubation (champ libre)  
           -- Instructions pré-anesthésique : \* Prémédication (liste des médicaments) : médoc, dose, camps administrés, durée/fréquence (ajout de lignes)  
                                                                 \* Jeûne (champ libre)  
                                                                  \* Tâches soignantes (champ libre)  
          Quand tous le CPA est fini :  validation + archive de dossier + renvoie du dossier dans le services chirurgie .**  
           
\* Visites pré-anesthésique (C.P.A) :   
            -- Un formulaire à remplir  
            -- Anesthésiste : \* Vérifier que les instructions pré-anesthésiques sont bien respectées  
                                       \* Donner l’ordonnance (médicament nécessaire à l’anesthésie)  
                                       \* Heure de départ au bloc : champ libre  
\* Bloc opératoire :  
Avant toutes choses , le programme opératoire est automatiquement générer dans le bloc (tous les détails nécessaire)  
           -- Check-list de sécurité chirurgicale : avant induction anesthésiques , avant incision chirurgicale , Bloc proprement dit  
           -- Protocole opératoire (champ libre) + avant sortie de bloc  
           -- Ajouter un onglet prescription  
  
Remarque : Après que le patient soit sortie de bloc , ce que le médecin devrais sur le patient , il devrait y voir : un nombre de jour après un opération chirurgicale  
  
3.2 Services Neurologie :   
             Ce service intègre diagnostics et soins liés aux fonctions nerveuses.  
         -- Examens spécifiques : Gestion des demandes et résultats d’électroencéphalogramme (EEG).  
        -- Rééducation : Coordination avec le service de kinésithérapie pour les soins de réadaptation.  
  
3.3 Service GEMI (Gastro-Entérologie et Médecine Interne) :   
             Ce service intègre des actes techniques invasifs directement dans le parcours de soin.  
          \* Actes techniques : Les médecins réalisent eux-mêmes les endoscopies.  
          \* Endoscopie : Interface spécifique pour la planification / la réalisation / le compte rendu.  
  
3.4 Services cliniques complémentaires (selon organisation) : stomatologie , gynécologique/obstétrique (Gynécologue)  
  
  
Règles Communes à tous les Services Cliniques :  
**Les règles suivantes s'appliquent à tous les services :**   
\* Circuit patient :** Toute prise en charge suit le flux : Observation médicale → Diagnostic → Soin/Traitement → Suivi et évolution → Sortie.**  
\* Nouvelle admission :** Chaque service génère une nouvelle prise en charge pour chaque patient entrant.**  
\* Gestion des sorties :** La sortie définitive ou le transfert est validé par le service de soin actuel.**  
\* Inter-service :** En cas de besoin, une demande d'avis est envoyée à un autre service. Une notification est répétée toutes les 5 minutes jusqu'à consultation.

4. **Pôle Para-Clinique (Plateau Technique) :  
 **Ce pôle centralise les ressources techniques nécessaires aux prescriptions des services cliniques. Le fonctionnement repose principalement sur un **système de rendez-vous**.**  
 4.1 Service Laboratoire : \* Activité :** Réalisation des analyses biologiques prescrites par les cliniciens.**  
 \* Livrable :** Les résultats sont transmis exclusivement sous forme de **texte**.**  
  
 4.2  Service Imagerie : \* Activité :** Examens radiologiques et autres techniques d'imagerie médicale.**  
 \* Flux :** Fonctionne exclusivement par rendez-vous.**  
 \* Livrable :** Les résultats sont transmis sous forme d'**images**.**  
  
 4.3  Services de Diagnostic Spécialisé (Anapath & Endoscopie) :   
 \* Anapath :** Service spécialisé fonctionnant sur rendez-vous pour les analyses anatomopathologiques.**  
 \* Endoscopie :   
 -  **Dispose d'une **interface logicielle dédiée**.**  
 -  **L'examen est réalisé par le médecin du service demandeur (par exemple, GEMI).**  
 - **L'accès est géré par rendez-vous.**  
  
 4.4  Services de Soins Techniques (Dialyse, EEG & Kiné) :  
 \* Dialyse :** Unité de traitement fonctionnant par rendez-vous.**  
 \*  EEG (Électroencéphalogramme) :** Service effectuant les tracés neurologiques, souvent sollicité par la Neurologie.**  
 \* Kiné (Kinésithérapie) :** Service de rééducation intervenant sur demande des services cliniques (Neurologie, UC, etc.).**  
  
4.5 Services dépôt de sang :  
              Si le service reçoit une demande de prescription pour transfusion sanguine il vérifie s’il y a le sang demander : deux possibilité :  le sang existe , faire une commande dans un l’hôpital fournisseur  , ou il n’y a pas de sang .  
Les poches de sang compose de :  groupe de sang , numéro de poche , date de péremption  
A la délivrance de poche vers le services , il doit apparaître :  n° de poche , le patient auquel on a donné la poche .  
  
Synthèse des Livrables  
![](data:image/png;base64,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)  
  
  
**

5. **Pôle Pharmacie (Logistique & Vente) :  
 **La pharmacie constitue le cœur financier et logistique de l’établissement (médicaments & consommables).  
5.1  **Organisation des postes : **  
 \* **Pharmacien(s) :** gestion globale (validation, supervision, coordination).  
 \* **Responsable  stock “gros” :** gestion des commandes et des transferts (stock en gros).  
 \* **Major :** supervision du service vente + consolidation / réception des rapports.  
 \* **Vente :** dispensation des médicaments + émission du **ticket de caisse**.  
5.2  **Circuit approvisionnement et stock :  
          \* Sources :** fournisseurs et donateurs.**  
          \* Réception :** enregistrement des entrées (réception par lot) + contrôle (quantité, péremption).**  
         \* Stockage : en gros (réserve) , En détail** (stock de dispensation / vente)**  
         \* Gestion des stocks :   
                       -- **Double inventaire : stock « en gros » et stock « en détail ».**  
                       -- Automatisation :** calcul automatique du stock minimal. Quand le seuil est atteint, le produit est ajouté automatiquement à la liste des commandes.**  
                      -- Traçabilité :** suivi des dates de péremption par lot.  
  
5.3 **Vente, sorties et finances :   
            \* Ventes & finances :   
                      -- **Calcul automatique des majorations sur les commandes.**  
                      -- **Priorisation des ventes selon l’urgence.**  
                      -- **Envoi des rapports de vente (par session d’utilisateur) au Major.**  
             \* Types de sortie :  
                      -- Bon de service** (sortie interne)**  
                      -- vente  
                      -- Transfert**

6. **Statistiques :  
Tous les services devraient avoir un rapport hebdomadaires de ses services . Afin de rendre facile les analyses de données.**

7. **Acteurs :  
Il y a des utilisateur qui ne peuvent pas accéder à certaines choses .**

- Médecin

- Interne

- Infirmier

- Laboratoire

- Radiologie

- Pharmacie

- Administration

- Agent d’accueil

- MAJOR

- et beaucoup d’autres mais je ne sais pas…  
  
Chaque acteur doit avoir :

       - ses permissions  
       - ses actions dans le système

-   

