import { ADRepository } from "../Repositories/ADRepository";
import { ADService } from "../Services/ADService";

export class ADServiceImpl implements ADService {
    protected adRepository: ADRepository;
    // Constructor del servicio
    constructor() {
        
        this.adRepository = new ADRepository();
    }
    /*public async fetchFileFromURL(fileUrl: any): Promise<any> {
        
    }
    public async authorize(authClient: any, fileContent: string, fileName: string, folderId: string): Promise<any> {

    }
    public async uploadFile(fileUrl: any, fileName: string, folderId: string): Promise<any> {

    }*/
    public async login(authCodeUrlParameters:any): Promise<any> {
        return this.adRepository.login(authCodeUrlParameters);
    }
    public async redirect(tokenRequest:any): Promise<any>{
        return this.adRepository.redirect(tokenRequest);
    }

}

