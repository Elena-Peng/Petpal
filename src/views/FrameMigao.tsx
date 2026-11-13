import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getPathByGuid } from "@/router/routes";
import { withStopPropagation } from "@/utils/utils";
import Bar from "@/components/Bar";
import StatusCards from "@/components/StatusCards";
import HomeReminders from "@/components/HomeReminders";
import { getCurrentUser } from "@/utils/userStore";
import { getCurrentPet, reminderPetKey, PET_SWITCH_EVENT, type Pet } from "@/utils/petStore";
import "@/styles/Frame332254.css";

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "早上好";
  if (h >= 12 && h < 18) return "下午好";
  return "晚上好";
}

const Frame332254 = () => {
    const navigate = useNavigate();
    const curUser = getCurrentUser();
    const [pet, setPet] = useState<Pet | undefined>(() => getCurrentPet());

    useEffect(() => {
        const onSwitch = () => setPet(getCurrentPet());
        window.addEventListener(PET_SWITCH_EVENT, onSwitch);
        return () => window.removeEventListener(PET_SWITCH_EVENT, onSwitch);
    }, []);

    const petKey = reminderPetKey(pet);

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

    // 静态宠物卡 → 档案页
    const click_332_320 = () => {
        navigate("/archive", { state: { from: "332:320" } });
    };

    // 名字胶囊：由宠物切换器绑定展开菜单，此处静默避免冲突
    const click_332_322 = () => {};

    const click_332_335 = () => {
        navigate("/archive", { state: { from: "332:335" } });
    };

    // 异宠推广 → 科普（异宠分类）
    const click_332_345 = () => {
        navigate("/science", { state: { from: "332:345" } });
    };

    // 今日状态块：卡片自带记录弹窗，整块保持装饰静默
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
                        <div id="332_259" className="Pixso-group-332_259">
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
                        <div id="332_266" className="Pixso-group-332_266">
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
                        <div id="332_273" className="Pixso-group-332_273">
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
                            <p id="332_283" className="Pixso-paragraph-332_283">
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
                        <p id="332_291" className="Pixso-paragraph-332_291">
                            {"狂犬疫苗即将到期"}
                        </p>
                        <p id="332_292" className="Pixso-paragraph-332_292">
                            {"晚间遛狗"}
                        </p>
                        <p id="332_293" className="Pixso-paragraph-332_293">
                            {"8月18日前·萌爪动物医院"}
                        </p>
                        <p id="332_294" className="Pixso-paragraph-332_294">
                            {"今天20:30·30分钟"}
                        </p>
                        <div
                            id="332_295"
                            className="Pixso-vector-332_295"
                        ></div>
                        <div
                            id="332_296"
                            className="Pixso-vector-332_296"
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
                            {pet?.statusSub || "根据今日记录继续保持当前照护节奏"}
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
                                {curUser?.nickname ? `${timeGreeting()}，${curUser.nickname}` : timeGreeting()}
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
                    <div
                        id="332_320"
                        className="Pixso-group-332_320"
                        onClick={withStopPropagation(click_332_320)}
                    >
                        <div
                            id="332_321"
                            className="Pixso-rectangle-332_321"
                        ></div>
                        <div
                            id="332_322"
                            className="Pixso-group-332_322"
                            onClick={withStopPropagation(click_332_322)}
                        >
                            <div
                                id="332_323"
                                className="Pixso-rectangle-332_323"
                            ></div>
                            <div
                                id="332_324"
                                className="Pixso-vector-332_324"
                            ></div>
                            <p id="332_325" className="Pixso-paragraph-332_325">
                                {"米糕"}
                            </p>
                        </div>
                        <div id="332_326" className="Pixso-group-332_326">
                            <p id="332_327" className="Pixso-paragraph-332_327">
                                {"健康状态良好"}
                            </p>
                            <div
                                id="332_328"
                                className="Pixso-vector-332_328"
                            ></div>
                            <div
                                id="332_329"
                                className="Pixso-vector-332_329"
                            ></div>
                        </div>
                        <div id="332_330" className="stroke-wrapper-332_330">
                            <div className="Pixso-rectangle-332_330 migao-photo"></div>
                            <div className="stroke-332_330"></div>
                        </div>
                        <div
                            id="332_331"
                            className="Pixso-rectangle-332_331"
                        ></div>
                        <p id="332_332" className="Pixso-paragraph-332_332">
                            {"今天状态不错"}
                        </p>
                        <p id="332_333" className="Pixso-paragraph-332_333">
                            {"活力稳定，饮水量比昨天增加8%"}
                        </p>
                        <div
                            id="332_334"
                            className="Pixso-vector-332_334"
                        ></div>
                    </div>
                    <div
                        id="332_335"
                        className="Pixso-group-332_335"
                        onClick={withStopPropagation(click_332_335)}
                    >
                        <div
                            id="332_336"
                            className="Pixso-rectangle-332_336"
                        ></div>
                        <div
                            id="332_337"
                            className="Pixso-vector-332_337"
                        ></div>
                        <div
                            id="332_338"
                            className="Pixso-vector-332_338"
                        ></div>
                        <p id="332_339" className="Pixso-paragraph-332_339">
                            {"26.4"}
                        </p>
                        <p id="332_340" className="Pixso-paragraph-332_340">
                            {"4,820"}
                        </p>
                        <p id="332_341" className="Pixso-paragraph-332_341">
                            {"8.2"}
                        </p>
                        <p id="332_342" className="Pixso-paragraph-332_342">
                            {"kg·体重"}
                        </p>
                        <p id="332_343" className="Pixso-paragraph-332_343">
                            {"步·运动"}
                        </p>
                        <p id="332_344" className="Pixso-paragraph-332_344">
                            {"h·睡眠"}
                        </p>
                    </div>
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
