import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { ParcelRoutes } from "../modules/parcel/parcel.route";
import { ContactRouter } from "../modules/contact/contact.routes";

export const router = Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/parcels",
    route: ParcelRoutes,
  },
  {
    path: "/contact",
    route: ContactRouter,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
