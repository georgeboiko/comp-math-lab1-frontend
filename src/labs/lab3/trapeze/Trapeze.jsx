import IntegralForm from "../shared/IntegralForm"

const ENDPOINTS = [
    { key: "trapeze", label: "[ TRAPEZE METHOD ]", url: "/api/lab/3/trapeze" },
]

function Trapeze() {
    return <IntegralForm title="МЕТОД ТРАПЕЦИЙ" endpoints={ENDPOINTS} />
}

export default Trapeze