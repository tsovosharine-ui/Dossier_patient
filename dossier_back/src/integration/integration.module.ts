import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalIntegrationService } from './external-integration.service';

@Module({
  imports: [HttpModule],
  providers: [ExternalIntegrationService],
  exports: [ExternalIntegrationService],
})
export class IntegrationModule {}
