// criar uma tipagem para o Response que possua
// data que deverá ser um objeto -> infos:{} || []
// error que deverá ser um booleano 
// exportar para utilizar na reposta do método get

export interface IResponse<T> {
    data: {
        infos: T
    }
    error: boolean
}