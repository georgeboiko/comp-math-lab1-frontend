import IntegralForm from "../shared/IntegralForm"

const ENDPOINTS = [
    { key: "montecarlo", label: "[ MONTE-CARLO METHOD ]", url: "/api/lab/3/montecarlo" },
]

function MonteCarlo() {
    return <IntegralForm title="МЕТОД МОНТЕ-КАРЛО" endpoints={ENDPOINTS} />
}

export default MonteCarlo