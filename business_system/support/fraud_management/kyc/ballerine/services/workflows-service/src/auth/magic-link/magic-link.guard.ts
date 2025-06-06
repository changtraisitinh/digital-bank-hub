import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export class MagicLinkGuard extends AuthGuard('magic-link') {
  async canActivate(context: ExecutionContext) {
    const result = await super.canActivate(context);
    const request = context.switchToHttp().getRequest<Request>();

    await super.logIn(request);

    return result as boolean;
  }
}
