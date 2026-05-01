import express, { Request, Response } from 'express'
import { IResponse } from './types';

const app = express();
const PORT = 3000;

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    const createResponse: IResponse<{nome: string}> = {
        data: {
            infos: {
                nome: 'Daniel Ventura de Almeida'
            }
        },
        error: false
    }

    res.json(createResponse)
})

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
})
