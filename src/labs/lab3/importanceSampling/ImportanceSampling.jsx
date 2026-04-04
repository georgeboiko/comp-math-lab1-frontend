import IntegralForm from "../shared/IntegralForm"

const ENDPOINTS = [
    { key: "importancesampling", label: "[ IMPORTANCE-SAMPLING METHOD ]", url: "/api/lab/3/importancesampling" },
]

function ImportanceSampling() {
    return <IntegralForm title="МЕТОД ВЫБОРКИ ПО ЗНАЧИМОСТИ" endpoints={ENDPOINTS} />
}

export default ImportanceSampling