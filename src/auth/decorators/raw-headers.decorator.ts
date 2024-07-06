import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const RawHeaders = createParamDecorator(
    (data:string, ctx: ExecutionContext)=>{

        //"capturar y retornar el rawHeaders de la solicitud/request"
        const req = ctx.switchToHttp().getRequest();

        return req.rawHeaders;

    }
);