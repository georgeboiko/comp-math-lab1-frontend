import IntegralForm from "../shared/IntegralForm"

const ENDPOINTS = [
    { key: "russianroulette", label: "[ RUSSIAN-ROULETTE METHOD ]", url: "/api/lab/3/russianroulette" },
]

function RussianRoulette() {
    return <IntegralForm title="МЕТОД РУССКОЙ РУЛЕТКИ" endpoints={ENDPOINTS} />
}

export default RussianRoulette