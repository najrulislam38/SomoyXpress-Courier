import { Response } from "express";

export interface ICookieToken {
  accessToken?: string;
  refreshToken?: string;
}

export const setCookie = (res: Response, tokenInfo: ICookieToken) => {
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
  }
  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
  }
};

export const clearCookie = (res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
};
