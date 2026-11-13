import Frame332254 from "@/views/Frame332254";
import HomeShell from "@/components/HomeShell";
import HomeMigaoShell from "@/components/HomeMigaoShell";
import HomeLuluShell from "@/components/HomeLuluShell";
import PaipaiShell from "@/components/PaipaiShell";
import ArchiveShell from "@/components/ArchiveShell";
import QuickOptionsShell from "@/components/QuickOptionsShell";
import HealthMetricsShell from "@/components/HealthMetricsShell";
import PetFamilyShell from "@/components/PetFamilyShell";
import PetEditShell from "@/components/PetEditShell";
import MyPostsShell from "@/components/MyPostsShell";
import ScienceShell from "@/components/ScienceShell";
import ScienceDetailShell from "@/components/ScienceDetailShell";
import CommunityShell from "@/components/CommunityShell";
import PostDetailShell from "@/components/PostDetailShell";
import UserProfileShell from "@/components/UserProfileShell";
import MessagesShell from "@/components/MessagesShell";
import ChatShell from "@/components/ChatShell";
import ServiceMessagesShell from "@/components/ServiceMessagesShell";
import PostComposeShell from "@/components/PostComposeShell";
import ServiceShell from "@/components/ServiceShell";
import ServiceCategoryShell from "@/components/ServiceCategoryShell";
import ServiceFavoritesShell from "@/components/ServiceFavoritesShell";
import MineFavoritesShell from "@/components/MineFavoritesShell";
import MallCartShell from "@/components/MallCartShell";
import MallProductShell from "@/components/MallProductShell";
import MineShell from "@/components/MineShell";
import ProviderShell from "@/components/ProviderShell";
import ServiceDetailShell from "@/components/ServiceDetailShell";
import AppointmentShell from "@/components/AppointmentShell";
import PetDetailShell from "@/components/PetDetailShell";
import RescueBaseShell from "@/components/RescueBaseShell";
import RescuePublishShell from "@/components/RescuePublishShell";
import MerchantShell from "@/components/MerchantShell";
import RescueStationShell from "@/components/RescueStationShell";
import ShopShell from "@/components/ShopShell";
import SearchShell from "@/components/SearchShell";
import SettingsShell from "@/components/SettingsShell";
import OrdersShell from "@/components/OrdersShell";
import ReminderManageShell from "@/components/ReminderManageShell";
import ReminderNewShell from "@/components/ReminderNewShell";
import ReminderEditShell from "@/components/ReminderEditShell";
import StatusLogShell from "@/components/StatusLogShell";
import SimplePage from "@/components/SimplePage";
import ProfileEditShell from "@/components/ProfileEditShell";
import AddressShell from "@/components/AddressShell";
import AddressEditShell from "@/components/AddressEditShell";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

export const routes = [
  {
    path: "/login",
    component: LoginPage,
    guid: "login",
  },
  {
    path: "/login/register",
    component: RegisterPage,
    guid: "login-register",
  },
  {
    path: "/",
    component: HomeShell,
    guid: "332:254",
  },
  {
    path: "/migao",
    component: HomeMigaoShell,
    guid: "332:80",
  },
  {
    path: "/lulu",
    component: HomeLuluShell,
    guid: "365:1",
  },
  {
    path: "/paipai",
    component: PaipaiShell,
    guid: "332:428",
  },
  {
    path: "/archive",
    component: ArchiveShell,
    guid: "332:484",
  },
  {
    path: "/archive/quick-options",
    component: QuickOptionsShell,
    guid: "332:485",
  },
  {
    path: "/archive/metrics",
    component: HealthMetricsShell,
    guid: "332:metrics",
  },
  {
    path: "/science",
    component: ScienceShell,
    guid: "332:894",
  },
  {
    path: "/science/detail",
    component: ScienceDetailShell,
    guid: "332:895",
  },
  {
    path: "/community",
    component: CommunityShell,
    guid: "332:2224",
  },
  {
    path: "/community/post",
    component: PostDetailShell,
    guid: "332:2226",
  },
  {
    path: "/community/user",
    component: UserProfileShell,
    guid: "332:2225",
  },
  {
    path: "/community/publish",
    component: PostComposeShell,
    guid: "372:721",
  },
  {
    path: "/service",
    component: ServiceShell,
    guid: "332:1286",
  },
  {
    path: "/service/category",
    component: ServiceCategoryShell,
    guid: "332:1287",
  },
  {
    path: "/service/favorites",
    component: ServiceFavoritesShell,
    guid: "332:1288",
  },
  {
    path: "/mine",
    component: MineShell,
    guid: "332:1500",
  },
  {
    path: "/mine/favorites",
    component: MineFavoritesShell,
    guid: "332:1501",
  },
  {
    path: "/mall/cart",
    component: MallCartShell,
    guid: "332:1502",
  },
  {
    path: "/mall/product",
    component: MallProductShell,
    guid: "332:1503",
  },
  {
    path: "/service/lili",
    component: ProviderShell,
    guid: "332:1510",
  },
  {
    path: "/service/detail",
    component: ServiceDetailShell,
    guid: "332:service-detail",
  },
  {
    path: "/service/appointment",
    component: AppointmentShell,
    guid: "332:service-appointment",
  },
  {
    path: "/service/pet",
    component: PetDetailShell,
    guid: "332:1511",
  },
  {
    path: "/service/rescue",
    component: RescueBaseShell,
    guid: "332:1512",
  },
  {
    path: "/service/rescue-publish",
    component: RescuePublishShell,
    guid: "332:1513",
  },
  {
    path: "/service/search",
    component: SearchShell,
    guid: "332:1514",
  },
  {
    path: "/settings",
    component: SettingsShell,
    guid: "332:1520",
  },
  {
    path: "/orders",
    component: OrdersShell,
    guid: "332:1530",
  },
  { path: "/mine/messages", component: MessagesShell, guid: "332:1601" },
  { path: "/mine/messages/service", component: ServiceMessagesShell, guid: "332:svc-msgs" },
  { path: "/mine/messages/chat", component: ChatShell, guid: "332:1602" },
  { path: "/mine/publishes", component: MyPostsShell, guid: "332:1602b" },
  { path: "/mine/health", component: PetFamilyShell, guid: "332:1603" },
  // 别名：/mine/family 也指向宠物家庭页，避免手输/旧链接落到未匹配路由白屏
  { path: "/mine/family", component: PetFamilyShell, guid: "332:1603b" },
  { path: "/mine/health/edit", component: PetEditShell, guid: "332:1604" },
  { path: "/mine/merchant", component: MerchantShell, guid: "332:merchant" },
  { path: "/mine/rescue-station", component: RescueStationShell, guid: "332:rescue-station" },
  { path: "/shop", component: ShopShell, guid: "332:shop" },
  { path: "/mine/medals", component: () => <SimplePage type="medals" />, guid: "332:1606" },
  { path: "/mine/history", component: () => <SimplePage type="history" />, guid: "332:1607" },
  { path: "/settings/profile", component: () => <SimplePage type="profile" />, guid: "332:1610" },
  { path: "/settings/account", component: () => <SimplePage type="account" />, guid: "332:1611" },
  { path: "/settings/help", component: () => <SimplePage type="help" />, guid: "332:1612" },
  { path: "/settings/about", component: () => <SimplePage type="about" />, guid: "332:1613" },
  { path: "/mine/profile/edit", component: ProfileEditShell, guid: "332:1620" },
  { path: "/mine/address", component: AddressShell, guid: "332:1621" },
  { path: "/mine/address/edit", component: AddressEditShell, guid: "332:1622" },
  { path: "/reminders", component: ReminderManageShell, guid: "332:1630" },
  { path: "/reminders/new", component: ReminderNewShell, guid: "332:1631" },
  { path: "/reminders/edit/:id", component: ReminderEditShell, guid: "332:1632" },
  { path: "/status/log/:type", component: StatusLogShell, guid: "332:1633" },
];

export const guidPathMap = new Map(
  routes.map((item) => [item.guid, item.path])
);
export const pathGuidMap = new Map(
  routes.map((item) => [item.path, item.guid])
);
export const getPathByGuid = (guid: string) => {
  return guidPathMap.get(guid) || "";
};
export const getGuidByPath = (path: string) => {
  return pathGuidMap.get(path) || "";
};
