import { Module } from '@nestjs/common';
import { ACLModule } from '@/common/access-control/acl.module';
import { CustomerControllerInternal } from '@/customer/customer.controller.internal';
import { CustomerRepository } from '@/customer/customer.repository';
import { CustomerService } from '@/customer/customer.service';
import { CustomerControllerExternal } from '@/customer/customer.controller.external';
import { PrismaModule } from '@/prisma/prisma.module';
import { ApiKeyRepository } from '@/customer/api-key/api-key.repository';
import { ApiKeyService } from '@/customer/api-key/api-key.service';
import { MerchantMonitoringModule } from '@/merchant-monitoring/merchant-monitoring.module';

@Module({
  imports: [ACLModule, PrismaModule, MerchantMonitoringModule],
  controllers: [CustomerControllerInternal, CustomerControllerExternal],
  providers: [CustomerService, CustomerRepository, ApiKeyService, ApiKeyRepository],
  exports: [ACLModule, CustomerService, CustomerRepository, ApiKeyService],
})
export class CustomerModule {}
