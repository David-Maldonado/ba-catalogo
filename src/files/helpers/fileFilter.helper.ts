export const fileFilter = ( req: Express.Request, file: Express.Multer.File, cb: Function) => {

    if (!file) return cb(new Error('File is empty'), false);

    //se obtiene la extension del archivo recibido
    const fileExtension = file.mimetype.split('/')[1];
    // una buena practica para extender las extensiones permitidas, traerlas desde las variables de entorno
    const validExtensions = ['jpg', 'png', 'jpeg', 'gif'];
   
    if(validExtensions.includes(fileExtension)){
        return cb(null, true);
    }

    cb(null, false);
}