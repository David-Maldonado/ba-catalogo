import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Socket, Server } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway( { cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect{

  @WebSocketServer() wss: Server;
  
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
    ) {}
  
  handleDisconnect(client: Socket ) {
    this.messagesWsService.removeClient(client);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
    // console.log({conectados: this.messagesWsService.getConnectedClients()});
 
  }
  async handleConnection(client: Socket) {
  
    const token = client.handshake.headers.authentication as string;
  
    let payload: JwtPayload;
    try {
      const payload = this.jwtService.verify(token);
   await   this.messagesWsService.registerClient(client, payload.id);
     
    } catch (error) {
      client.disconnect(true);
      return;
    }

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());

    // console.log({conectados: this.messagesWsService.getConnectedClients()});
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto){
   //!Emite únicamente al cliente que envió el mensaje
  //  client.emit('message-from-server',{
  //   fullName: 'Soy yo',
  //   message: payload.message 

  //    });

  //!Emite a todos los clientes menos al que envió el mensaje
  //  client.broadcast.emit('message-from-server',{
  //   fullName: 'Soy yo',
  //   message: payload.message
  //   });

  //!Emite a todos los clientes incluyendo al que envió el mensaje
  this.wss.emit('message-from-server',{
    fullName: this.messagesWsService.getUserFullName(client.id),
    message: payload.message
    });


  }





}
