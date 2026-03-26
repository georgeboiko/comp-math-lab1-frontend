import IntegralForm from "../shared/IntegralForm"

const ENDPOINTS = [
    { key: "simpson", label: "[ SIMPSON METHOD ]", url: "/api/lab/3/simpson" },
]

function Simpson() {
    return <IntegralForm title="МЕТОД СИМПСОНА" endpoints={ENDPOINTS} />
}

export default Simpson