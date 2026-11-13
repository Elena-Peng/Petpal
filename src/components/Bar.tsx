import { useNavigate } from "react-router";
import { getPathByGuid } from "@/router/routes";
import { withStopPropagation } from "@/utils/utils";
import "@/styles/Bar.css";
interface BarProps {
    id?: string;
    className?: string;
    slot_2_426?: React.ReactNode;
    slot_2_427?: React.ReactNode;
    slot_2_428?: React.ReactNode;
    slot_2_429?: React.ReactNode;
    slot_2_430?: React.ReactNode;
    slot_2_431?: React.ReactNode;
    slot_2_432?: React.ReactNode;
    slot_2_433?: React.ReactNode;
    slot_2_434?: React.ReactNode;
    slot_2_435?: React.ReactNode;
}
const Bar = (props: BarProps) => {
    const {
        id,
        className = "",
        slot_2_426,
        slot_2_427,
        slot_2_428,
        slot_2_429,
        slot_2_430,
        slot_2_431,
        slot_2_432,
        slot_2_433,
        slot_2_434,
        slot_2_435
    } = props;

    const navigate = useNavigate();

    const click_2_459 = () => {
        // guid 查不到时静默，避免 navigate('') 死点击；实际 Tab 跳转由 BottomNav 统一绑定
        const path = getPathByGuid("4:227");
        if (path) {
            navigate(path, {
                state: {
                    from: "2:459",
                    et: "c"
                }
            });
        }
    };

    return (
        <div className={`component-2_437 ${className}`} id={id}>
            <div id="2_437" className="Pixso-symbol-2_437">
                <div id="2_415" className="Pixso-rectangle-2_415"></div>
                {slot_2_426 ?? (
                    <div id="2_426" className="vector-wrapper-2_426">
                        <div id="2_426" className="Pixso-vector-2_426"></div>
                    </div>
                )}
                {slot_2_427 ?? (
                    <div id="2_427" className="vector-wrapper-2_427">
                        <div id="2_427" className="Pixso-vector-2_427"></div>
                    </div>
                )}
                {slot_2_428 ?? (
                    <div id="2_428" className="vector-wrapper-2_428">
                        <div id="2_428" className="Pixso-vector-2_428"></div>
                    </div>
                )}
                {slot_2_429 ?? (
                    <div id="2_429" className="vector-wrapper-2_429">
                        <div id="2_429" className="Pixso-vector-2_429"></div>
                    </div>
                )}
                {slot_2_430 ?? (
                    <div id="2_430" className="vector-wrapper-2_430">
                        <div id="2_430" className="Pixso-vector-2_430"></div>
                    </div>
                )}
                {slot_2_431 ?? (
                    <p id="2_431" className="Pixso-paragraph-2_431">
                        {"首页"}
                    </p>
                )}
                {slot_2_432 ?? (
                    <p id="2_432" className="Pixso-paragraph-2_432">
                        {"科普"}
                    </p>
                )}
                {slot_2_433 ?? (
                    <p id="2_433" className="Pixso-paragraph-2_433">
                        {"社区"}
                    </p>
                )}
                {slot_2_434 ?? (
                    <p id="2_434" className="Pixso-paragraph-2_434">
                        {"服务"}
                    </p>
                )}
                {slot_2_435 ?? (
                    <p id="2_435" className="Pixso-paragraph-2_435">
                        {"我的"}
                    </p>
                )}
                <div
                    id="2_459"
                    className="Pixso-rectangle-2_459"
                    onClick={withStopPropagation(click_2_459)}
                ></div>
                <div id="2_460" className="Pixso-rectangle-2_460"></div>
                <div id="2_474" className="Pixso-rectangle-2_474"></div>
                <div id="4_3" className="Pixso-rectangle-4_3"></div>
                <div id="4_4" className="Pixso-rectangle-4_4"></div>
            </div>
        </div>
    );
};
export default Bar;
