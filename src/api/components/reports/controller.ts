import { Ipages, IWhereParams, Iorder } from 'interfaces/Ifunctions';
import moment from 'moment';
import { EConcatWhere, EModeWhere, ESelectFunct } from '../../../enums/EfunctMysql';
import { Tables, Columns } from '../../../enums/EtablesDB';
import StoreType from '../../../store/mysql';


export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const fiscalReport = async (fromDate: string, toDate: string) => {

        const filters: Array<IWhereParams> = [{
            mode: EModeWhere.higherEqual,
            concat: EConcatWhere.and,
            items: [{ column: Columns.facturas.fecha, object: String(moment(fromDate).format("YYYY-MM-DD")) }]
        }, {
            mode: EModeWhere.lessEqual,
            concat: EConcatWhere.and,
            items: [{ column: Columns.facturas.fecha, object: String(moment(toDate).format("YYYY-MM-DD")) }]
        }, {
            mode: EModeWhere.strict,
            concat: EConcatWhere.and,
            items: [{ column: Columns.facturas.id_fact_asoc, object: String(0) }]
        }]
        const groupBy = [Columns.facturas.fecha, Columns.facturas.fiscal]
        const order: Iorder = {
            columns: [Columns.facturas.fecha],
            asc: true
        }

        const data: Array<{
            FECHA: string,
            TOTAL: number,
            fiscal: number
        }> = await store.list(Tables.FACTURAS, [`SUM(${Columns.facturas.total_fact}) as TOTAL`, `DATE_FORMAT(${Columns.facturas.fecha}, "%d/%m") as FECHA`, Columns.facturas.fiscal], filters, groupBy, undefined, undefined, order)
        let totalnoFiscal = 0
        let totalFiscal = 0

        const fiscales = data.filter(item => item.fiscal === 1)
        const noFiscales = data.filter(item => item.fiscal === 0)
        const fiscalesNumb = fiscales.map(item => {
            totalFiscal = totalFiscal + item.TOTAL
            return item.TOTAL
        })
        const noFiscalesNumb = noFiscales.map(item => {
            totalnoFiscal = totalnoFiscal + item.TOTAL
            return item.TOTAL
        })

        const labels = data.map(item => {
            return item.FECHA
        })
        const labels2 = labels.filter((item, key) => labels.indexOf(item) === key)

        return {
            fiscales: fiscalesNumb,
            noFiscales: noFiscalesNumb,
            labels: labels2,
            totalFiscal: totalFiscal,
            totalnoFiscal: totalnoFiscal
        }
    }

    return {
        fiscalReport
    }
}
