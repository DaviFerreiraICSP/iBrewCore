import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext ): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler())
        
        if (!requiredRoles) {
            return true;
        }

        const { user }  =  context.switchToHttp().getRequest();

        // Verifica se o usuário tem um dos papéis necessários
        
        const hasRole = requiredRoles.some((role) => user.roles.includes(role));

        if (!hasRole) {
            throw new ForbiddenException('Forbidden');
        }
    
        return true;
    }

}