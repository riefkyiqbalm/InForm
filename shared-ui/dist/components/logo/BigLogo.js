import { jsx as _jsx } from "react/jsx-runtime";
export default function BigLogo({ className, style }) {
    const defaultStyle = {
        fontSize: '2rem',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        display: 'inline-block',
        ...style,
    };
    return (_jsx("div", { className: className, style: defaultStyle, children: "I\u2022F" }));
}
//# sourceMappingURL=BigLogo.js.map