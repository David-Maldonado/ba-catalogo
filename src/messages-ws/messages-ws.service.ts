import { Injectable } from '@nestjs/common';
import {Socket} from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
    [id:string]: {
        socket: Socket,
        user: User
    }
}

@Injectable()
export class MessagesWsService {
    constructor(
        @InjectRepository(User)
        private readonly userReposiotry: Repository<User>,
    ) {}

    private connectedClientes: ConnectedClients = {};


    async registerClient (client: Socket, idUser: string){
        const user = await this.userReposiotry.findOneBy({id: idUser});
        if(!user) throw new Error('User not found');
        if(!user.isActive) throw new Error('User not active');

        this.checkUserConection(user);

        this.connectedClientes[client.id] = {
            socket: client,
            user
        };
       
    }

    removeClient(cliente: Socket){
       delete this.connectedClientes[cliente.id]
    }

    getConnectedClients():string[] {
        return Object.keys(this.connectedClientes);
    }

    getUserFullName(socketId: string) {
        return this.connectedClientes[socketId].user.fullName
    }

    // no permitir varias conexiones con el mismo usuario
    private checkUserConection(user: User) {
       for(const clientId of Object.keys(this.connectedClientes)){
           const client = this.connectedClientes[clientId];
              if(client.user.id === user.id){
                    client.socket.disconnect();
                    break;
              }
              
       }
    }


}
