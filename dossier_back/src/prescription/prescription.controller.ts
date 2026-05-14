import { Controller, Get, Post, Patch, Body, Param, Delete } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Controller('patients/:patientId/prescriptions')
export class PrescriptionController {
  constructor(private readonly service: PrescriptionService) {}

  @Post()
  create(@Param('patientId') patientId: string, @Body() createDto: CreatePrescriptionDto) {
    return this.service.create({ ...createDto, patientId });
  }

  @Get()
  findAll(@Param('patientId') patientId: string) {
    return this.service.findAllByPatient(patientId);
  }

  @Get('active')
  findActive(@Param('patientId') patientId: string) {
    return this.service.findActiveByPatient(patientId);
  }

  @Patch(':id')
  update(
    @Param('patientId') patientId: string,
    @Param('id') id: string,
    @Body() updateData: Partial<CreatePrescriptionDto>,
  ) {
    return this.service.update(id, patientId, updateData);
  }

  @Patch(':id/validate')
  validate(@Param('patientId') patientId: string, @Param('id') id: string) {
    return this.service.validate(id, patientId);
  }

  @Delete(':id')
  remove(@Param('patientId') patientId: string, @Param('id') id: string) {
    return this.service.remove(id, patientId);
  }
}
