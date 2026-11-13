import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getPathByGuid } from "@/router/routes";
import { withStopPropagation } from "@/utils/utils";
import Bar from "@/components/Bar";
import HomeReminders from "@/components/HomeReminders";
import StatusCards from "@/components/StatusCards";
import HomePetCard from "@/components/HomePetCard";
import { getCurrentUser, USER_UPDATE_EVENT } from "@/utils/userStore";
import { getCurrentPet, reminderPetKey, PET_SWITCH_EVENT, type Pet } from "@/utils/petStore";
import "@/styles/Frame332254.css";

// 按当前时段返回问候语：早上 / 下午 / 晚上
function timeGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "早上好";
  if (h >= 12 && h < 18) return "下午好";
  return "晚上好";
}

const Frame332254 = () => {
    const navigate = useNavigate();
    const [curUser, setCurUser] = useState(getCurrentUser());
    const [done1, setDone1] = useState(false);
    const [done2, setDone2] = useState(false);
    const [pet, setPet] = useState<Pet | undefined>(() => getCurrentPet());

    // 跟随用户资料变更（登录/换头像/改昵称）刷新问候区头像与昵称，与"我的"页头像实时联动
    useEffect(() => {
        const onUser = () => setCurUser(getCurrentUser());
        window.addEventListener(USER_UPDATE_EVENT, onUser);
        return () => window.removeEventListener(USER_UPDATE_EVENT, onUser);
    }, []);

    // 跟随宠物切换刷新当前宠物数据（提醒 / AI 小结 / 管理入口均以此为准）
    useEffect(() => {
        const onSwitch = () => setPet(getCurrentPet());
        window.addEventListener(PET_SWITCH_EVENT, onSwitch);
        return () => window.removeEventListener(PET_SWITCH_EVENT, onSwitch);
    }, []);

    const petKey = reminderPetKey(pet);

    // guid 查不到时静默，不触发 navigate('') 死点击
    const goGuid = (guid: string, state?: Record<string, unknown>) => {
        const path = getPathByGuid(guid);
        if (path) navigate(path, { state });
    };

    const click_332_301 = () => {
        goGuid("332:428", { from: "332:301", et: "c" });
    };

    // 问候左侧图标：纯装饰，静默
    const click_332_311 = () => {};

    // 问候头像区 → 我的
    const click_332_314 = () => {
        navigate("/mine", { state: { from: "332:314" } });
    };

    const click_332_319 = () => {
        navigate("/mine", { state: { from: "332:319" } });
    };

    // 异宠推广 → 科普（异宠分类）
    const click_332_345 = () => {
        navigate("/science", { state: { from: "332:345" } });
    };

    // 今日状态块：卡片自带记录弹窗，整块保持装饰静默（全部记录入口已绑定档案页）
    // 附近优选卡片 → 服务详情页（详情页内可继续预约下单）
    const openNearby = (name: string) => {
        navigate("/service/detail?name=" + encodeURIComponent(name), { state: { from: "/" } });
    };

    const click_332_368 = () => {};

    const click_332_372 = () => {
        goGuid("332:484", { from: "332:372", et: "c" });
    };

    const click_332_408 = () => {};

    return (
        <div className="scroll-container">
            <div id="332_254" className="Pixso-frame-332_254">
                <div id="332_255" className="Pixso-rectangle-332_255"></div>
                <div id="332_256" className="Pixso-frame-332_256">
                    <div id="332_257" className="Pixso-rectangle-332_257"></div>
                    <div id="332_258" className="Pixso-group-332_258">
                        <div
                            id="332_259"
                            className="Pixso-group-332_259"
                            onClick={withStopPropagation(() => openNearby("乐乐宠物店"))}
                            style={{ cursor: "pointer" }}
                        >
                            <div
                                id="332_260"
                                className="Pixso-rectangle-332_260"
                            ></div>
                            <div
                                id="332_261"
                                className="Pixso-rectangle-332_261"
                            ></div>
                            <p id="332_262" className="Pixso-paragraph-332_262">
                                {"宠物寄养 运输分离"}
                            </p>
                            <p id="332_263" className="Pixso-paragraph-332_263">
                                {"￥129.00"}
                            </p>
                            <p id="332_264" className="Pixso-paragraph-332_264">
                                {"湖南 长沙"}
                            </p>
                            <p id="332_265" className="Pixso-paragraph-332_265">
                                {"乐乐宠物店"}
                            </p>
                        </div>
                        <div
                            id="332_266"
                            className="Pixso-group-332_266"
                            onClick={withStopPropagation(() => openNearby("迪迪乐旗舰店"))}
                            style={{ cursor: "pointer" }}
                        >
                            <div
                                id="332_267"
                                className="Pixso-rectangle-332_267"
                            ></div>
                            <div
                                id="332_268"
                                className="Pixso-rectangle-332_268"
                            ></div>
                            <p id="332_269" className="Pixso-paragraph-332_269">
                                {"广东 广州"}
                            </p>
                            <p id="332_270" className="Pixso-paragraph-332_270">
                                {"迪迪乐旗舰店"}
                            </p>
                            <p id="332_271" className="Pixso-paragraph-332_271">
                                {"￥58.00"}
                            </p>
                            <p id="332_272" className="Pixso-paragraph-332_272">
                                {"宠物食品日用玩具"}
                            </p>
                        </div>
                        <div
                            id="332_273"
                            className="Pixso-group-332_273"
                            onClick={withStopPropagation(() => openNearby("南大公园"))}
                            style={{ cursor: "pointer" }}
                        >
                            <div
                                id="332_274"
                                className="Pixso-rectangle-332_274"
                            ></div>
                            <p id="332_275" className="Pixso-paragraph-332_275">
                                {"南大公园"}
                            </p>
                            <div
                                id="332_276"
                                className="Pixso-rectangle-332_276"
                            ></div>
                            <p id="332_277" className="Pixso-paragraph-332_277">
                                {"上海"}
                            </p>
                            <p id="332_278" className="Pixso-paragraph-332_278">
                                {"一个爱狗人士"}
                            </p>
                            <p id="332_279" className="Pixso-paragraph-332_279">
                                {"宠物外出地点推荐"}
                            </p>
                        </div>
                        <div id="332_280" className="Pixso-group-332_280">
                            <div
                                id="332_281"
                                className="Pixso-vector-332_281"
                            ></div>
                            <p id="332_282" className="Pixso-paragraph-332_282">
                                {"附近优选"}
                            </p>
                            <p
                                id="332_283"
                                className="Pixso-paragraph-332_283"
                                onClick={withStopPropagation(() => navigate("/service"))}
                                style={{ cursor: "pointer" }}
                            >
                                {"查看更多"}
                            </p>
                        </div>
                    </div>
                    <div id="332_284" className="Pixso-group-332_284">
                        <div id="332_285" className="stroke-wrapper-332_285">
                            <div className="Pixso-rectangle-332_285"></div>
                            <div className="stroke-332_285"></div>
                        </div>
                        <div
                            id="332_286"
                            className="Pixso-vector-332_286"
                        ></div>
                        <div
                            id="332_287"
                            className="Pixso-rectangle-332_287"
                        ></div>
                        <div
                            id="332_288"
                            className="Pixso-rectangle-332_288"
                        ></div>
                        <div
                            id="332_289"
                            className="Pixso-rectangle-332_289"
                        ></div>
                        <div
                            id="332_290"
                            className="Pixso-vector-332_290"
                        ></div>
                        <p id="332_291" className={"Pixso-paragraph-332_291" + (done1 ? " reminder-done" : "")} onClick={() => setDone1(!done1)} style={{cursor: "pointer"}}>
                            {"狂犬疫苗即将到期"}
                        </p>
                        <p id="332_292" className={"Pixso-paragraph-332_292" + (done2 ? " reminder-done" : "")} onClick={() => setDone2(!done2)} style={{cursor: "pointer"}}>
                            {"晚间遛狗"}
                        </p>
                        <p id="332_293" className={"Pixso-paragraph-332_293" + (done1 ? " reminder-done" : "")}>
                            {"8月18日前·萌爪动物医院"}
                        </p>
                        <p id="332_294" className={"Pixso-paragraph-332_294" + (done2 ? " reminder-done" : "")}>
                            {"今天20:30·30分钟"}
                        </p>
                        <div
                            id="332_295"
                            className={"Pixso-vector-332_295" + (done1 ? " reminder-check-done" : "")}
                            onClick={() => setDone1(!done1)}
                            style={{cursor: "pointer"}}
                        ></div>
                        <div
                            id="332_296"
                            className={"Pixso-vector-332_296" + (done2 ? " reminder-check-done" : "")}
                            onClick={() => setDone2(!done2)}
                            style={{cursor: "pointer"}}
                        ></div>
                        <div id="332_297" className="Pixso-group-332_297">
                            <div
                                id="332_298"
                                className="Pixso-vector-332_298"
                            ></div>
                            <p id="332_299" className="Pixso-paragraph-332_299">
                                {"今日提醒"}
                            </p>
                            <p id="332_300" className="Pixso-paragraph-332_300" onClick={() => navigate(`/reminders?pet=${petKey}`)} style={{cursor: "pointer"}}>
                                {"管理"}
                            </p>
                        </div>
                        <HomeReminders pet={petKey as any} />
                    </div>
                    <div
                        id="332_301"
                        className="Pixso-group-332_301"
                        onClick={withStopPropagation(click_332_301)}
                    >
                        <div id="332_302" className="stroke-wrapper-332_302">
                            <div className="Pixso-rectangle-332_302"></div>
                            <div className="stroke-332_302"></div>
                        </div>
                        <p id="332_303" className="Pixso-paragraph-332_303">
                            {pet ? `${pet.name}的${pet.status}` : "今日状态数据保持稳定"}
                        </p>
                        <p id="332_304" className="Pixso-paragraph-332_304">
                            {"AI 派派·今日小节"}
                        </p>
                        <p id="332_305" className="Pixso-paragraph-332_305">
                            {pet?.statusSub || "完善档案后，这里会展示它的健康建议"}
                        </p>
                        <div
                            id="332_306"
                            className="Pixso-rectangle-332_306"
                        ></div>
                        <div
                            id="332_307"
                            className="Pixso-rectangle-332_307"
                        ></div>
                        <div id="332_308" className="stroke-wrapper-332_308">
                            <div className="Pixso-rectangle-332_308"></div>
                            <div className="stroke-332_308"></div>
                        </div>
                        <div
                            id="332_309"
                            className="Pixso-rectangle-332_309"
                        ></div>
                    </div>
                    <div id="332_310" className="Pixso-group-332_310">
                        <div
                            id="332_311"
                            className="Pixso-group-332_311"
                            onClick={withStopPropagation(click_332_311)}
                        >
                            <div
                                id="332_312"
                                className="Pixso-vector-332_312"
                            ></div>
                            <div
                                id="332_313"
                                className="Pixso-rectangle-332_313"
                            ></div>
                            {/* 问候区头像：与我的页用户头像保持一致（有上传显示照片，无则灰底人形占位） */}
                            {curUser && (curUser.avatar && String(curUser.avatar).startsWith("data:") ? (
                                <img className="home-greet-avatar" src={curUser.avatar} alt="" />
                            ) : (
                                <div className="home-greet-avatar" aria-label="暂无头像">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                </div>
                            ))}
                        </div>
                        <div
                            id="332_314"
                            className="Pixso-group-332_314"
                            onClick={withStopPropagation(click_332_314)}
                        >
                            <div
                                id="332_315"
                                className="Pixso-vector-332_315"
                            ></div>
                            <div
                                id="332_316"
                                className="Pixso-vector-332_316"
                            ></div>
                            <p id="332_317" className="Pixso-paragraph-332_317">
                                {(() => {
                                    const greetName = curUser?.nickname || pet?.name;
                                    return greetName ? `${timeGreeting()}，${greetName}` : timeGreeting();
                                })()}
                            </p>
                            <p id="332_318" className="Pixso-paragraph-332_318">
                                {"上海·27℃"}
                            </p>
                            <div
                                id="332_319"
                                className="Pixso-rectangle-332_319"
                                onClick={withStopPropagation(click_332_319)}
                            ></div>
                        </div>
                    </div>
                    <HomePetCard />
                    <div
                        id="332_345"
                        className="Pixso-group-332_345"
                        onClick={withStopPropagation(click_332_345)}
                    >
                        <div id="332_346" className="stroke-wrapper-332_346">
                            <div className="Pixso-rectangle-332_346"></div>
                            <div className="stroke-332_346"></div>
                        </div>
                        <p id="332_347" className="Pixso-paragraph-332_347">
                            {"PETPAL 异宠专属"}
                        </p>
                        <p id="332_348" className="Pixso-paragraph-332_348">
                            {"不只猫犬，每一种陪伴都被认真对待"}
                        </p>
                        <div
                            id="332_349"
                            className="Pixso-vector-332_349"
                        ></div>
                        <div
                            id="332_352"
                            className="Pixso-vector-332_352"
                        ></div>
                        <p id="332_355" className="Pixso-paragraph-332_355">
                            {
                                "鸟类·爬宠·小型哺乳·水族，按物种管理环境、饮食与健康"
                            }
                        </p>
                        <div id="332_356" className="Pixso-group-332_356">
                            <div
                                id="332_357"
                                className="Pixso-rectangle-332_357"
                            ></div>
                            <div
                                id="332_358"
                                className="Pixso-rectangle-332_358"
                            ></div>
                            <p id="332_359" className="Pixso-paragraph-332_359">
                                {"鸟类"}
                            </p>
                        </div>
                        <div id="332_360" className="Pixso-group-332_360">
                            <div
                                id="332_361"
                                className="Pixso-rectangle-332_361"
                            ></div>
                            <p id="332_362" className="Pixso-paragraph-332_362">
                                {"爬宠"}
                            </p>
                            <div
                                id="332_363"
                                className="Pixso-rectangle-332_363"
                            ></div>
                        </div>
                        <div id="332_364" className="Pixso-group-332_364">
                            <div
                                id="332_365"
                                className="Pixso-rectangle-332_365"
                            ></div>
                            <p id="332_366" className="Pixso-paragraph-332_366">
                                {"小宠"}
                            </p>
                            <div
                                id="332_367"
                                className="Pixso-rectangle-332_367"
                            ></div>
                        </div>
                    </div>
                    <div
                        id="332_368"
                        className="Pixso-group-332_368"
                        onClick={withStopPropagation(click_332_368)}
                    >
                        <div id="332_369" className="Pixso-group-332_369">
                            <div
                                id="332_370"
                                className="Pixso-vector-332_370"
                            ></div>
                            <p id="332_371" className="Pixso-paragraph-332_371">
                                {"今日状态"}
                            </p>
                            <p
                                id="332_372"
                                className="Pixso-paragraph-332_372"
                                onClick={withStopPropagation(click_332_372)}
                            >
                                {"全部记录"}
                            </p>
                        </div>
                        <StatusCards />
                    </div>
                    <div id="332_408" className="stroke-wrapper-332_408">
                        <div
                            className="Pixso-rectangle-332_408"
                            onClick={withStopPropagation(click_332_408)}
                        ></div>
                        <div className="stroke-332_408"></div>
                    </div>
                </div>
                <Bar
                    id="332_427"
                    className="Pixso-instance-332_427"
                    slot_2_430={
                        <div id="431_118" className="vector-wrapper-431_118">
                            <div
                                id="431_118"
                                className="Pixso-vector-431_118"
                            ></div>
                        </div>
                    }
                    slot_2_429={
                        <div id="431_117" className="vector-wrapper-431_117">
                            <div
                                id="431_117"
                                className="Pixso-vector-431_117"
                            ></div>
                        </div>
                    }
                    slot_2_428={
                        <div id="431_116" className="vector-wrapper-431_116">
                            <div
                                id="431_116"
                                className="Pixso-vector-431_116"
                            ></div>
                        </div>
                    }
                    slot_2_427={
                        <div id="431_115" className="vector-wrapper-431_115">
                            <div
                                id="431_115"
                                className="Pixso-vector-431_115"
                            ></div>
                        </div>
                    }
                    slot_2_426={
                        <div id="431_114" className="vector-wrapper-431_114">
                            <div
                                id="431_114"
                                className="Pixso-vector-431_114"
                            ></div>
                        </div>
                    }
                    slot_2_435={
                        <p id="431_123" className="Pixso-paragraph-431_123">
                            {"我的"}
                        </p>
                    }
                    slot_2_434={
                        <p id="431_122" className="Pixso-paragraph-431_122">
                            {"服务"}
                        </p>
                    }
                    slot_2_433={
                        <p id="431_121" className="Pixso-paragraph-431_121">
                            {"社区"}
                        </p>
                    }
                    slot_2_432={
                        <p id="431_120" className="Pixso-paragraph-431_120">
                            {"科普"}
                        </p>
                    }
                    slot_2_431={
                        <p id="431_119" className="Pixso-paragraph-431_119">
                            {"首页"}
                        </p>
                    }
                ></Bar>
            </div>
        </div>
    );
};
export default Frame332254;
