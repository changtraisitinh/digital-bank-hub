import { CustomerSubscriptionSchema } from './schemas/zod-schemas';
import * as common from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import * as swagger from '@nestjs/swagger';
import { CustomerService } from '@/customer/customer.service';
import { Customer } from '@prisma/client';
import { CustomerModel } from '@/customer/customer.model';
import { AuthenticatedEntity, type TProjectId } from '@/types';
import { CustomerAuthGuard } from '@/common/guards/customer-auth.guard';
import { ZodValidationPipe } from '@/common/pipes/zod.pipe';
import { CustomerSubscriptionDto } from './dtos/customer-config-create.dto';
import { ValidationError } from '@/errors';
import { TDemoCustomer } from '@/customer/types';
import { CurrentProject } from '@/common/decorators/current-project.decorator';

@swagger.ApiTags('Customers')
@swagger.ApiExcludeController()
@common.Controller('external/customers')
export class CustomerControllerExternal {
  constructor(protected readonly service: CustomerService) {}

  @common.Get('/me')
  @UseGuards(CustomerAuthGuard)
  @swagger.ApiOkResponse({ type: [CustomerModel] })
  @swagger.ApiForbiddenResponse()
  find(@Request() req: any): Partial<Customer> {
    return (req.user as AuthenticatedEntity).customer!;
  }

  @common.Post('subscriptions')
  @swagger.ApiOkResponse({ type: CustomerSubscriptionDto })
  @swagger.ApiForbiddenResponse()
  @swagger.ApiBadRequestResponse({ type: ValidationError })
  @UseGuards(CustomerAuthGuard)
  @UsePipes(new ZodValidationPipe(CustomerSubscriptionSchema, 'body'))
  async createSubscriptions(
    @common.Body() data: CustomerSubscriptionDto,
    @Request() req: any,
  ): Promise<Pick<Customer, 'subscriptions'>> {
    const customer = (req.user as AuthenticatedEntity).customer!;

    const { subscriptions, ...updatedCustomer } = await this.service.updateById(customer.id!, {
      data,
    });

    return { subscriptions: data.subscriptions };
  }

  @common.Get('/by-current-project-id')
  @swagger.ApiOkResponse({ type: [CustomerModel] })
  @swagger.ApiForbiddenResponse()
  async getByCurrentProjectId(
    @CurrentProject() currentProjectId: TProjectId,
  ): Promise<TDemoCustomer> {
    if (!currentProjectId) {
      throw new NotFoundException('Customer not found');
    }

    const customer = await this.service.getByProjectId(currentProjectId, {
      select: {
        id: true,
        name: true,
        displayName: true,
        logoImageUri: true,
        faviconImageUri: true,
        country: true,
        language: true,
        customerStatus: true,
        config: true,
        features: true,
        createdAt: true,
      },
    });

    if (!customer) {
      throw new BadRequestException('Customer not found');
    }

    if (customer.config?.isDemoAccount) {
      customer.config = {
        ...customer.config,
        demoAccessDetails: await this.service.getAccessDetails(customer),
      };
    }

    return customer;
  }
}
