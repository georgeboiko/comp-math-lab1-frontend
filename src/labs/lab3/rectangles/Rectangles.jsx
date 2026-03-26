import IntegralForm from "../shared/IntegralForm"

const ENDPOINTS = [
    { key: "left",   label: "[ LEFT RECTANGLES ]",   url: "/api/lab/3/rectangles/left"   },
    { key: "middle", label: "[ MIDDLE RECTANGLES ]",  url: "/api/lab/3/rectangles/middle" },
    { key: "right",  label: "[ RIGHT RECTANGLES ]",   url: "/api/lab/3/rectangles/right"  },
]

function Rectangles() {
    return <IntegralForm title="МЕТОД ПРЯМОУГОЛЬНИКОВ" endpoints={ENDPOINTS} />
}

export default Rectangles