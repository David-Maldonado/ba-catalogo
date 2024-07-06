import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

//los docradores son funciones
export const GetUser = createParamDecorator(
    //cuando nest lo llame voy a tener los parametros
    (data:string, ctx: ExecutionContext)=>{



        const req = ctx.switchToHttp().getRequest();

        const user = req.user;

        if(!user)
            throw new InternalServerErrorException('User not found (request)');
    
        return (!data) ? user : user[data];
    }
);