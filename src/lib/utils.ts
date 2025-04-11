import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import male1 from "@/assets/images/profile/male_1.png";
import male2 from "@/assets/images/profile/male_2.png";
import male3 from "@/assets/images/profile/male_3.png";
import male4 from "@/assets/images/profile/male_4.png";
import male5 from "@/assets/images/profile/male_5.png";
import male6 from "@/assets/images/profile/male_6.png";
import female1 from "@/assets/images/profile/female_1.png";
import female2 from "@/assets/images/profile/female_2.png";
import female3 from "@/assets/images/profile/female_3.png";
import female4 from "@/assets/images/profile/female_4.png";
import female5 from "@/assets/images/profile/female_5.png";
import female6 from "@/assets/images/profile/female_6.png";

const maleImages = [male1, male2, male3, male4, male5, male6];
const femaleImages = [female1, female2, female3, female4, female5, female6];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getRandomInt = (max: number) => Math.floor(Math.random() * max) + 1;

const getOrSetImageIndex = (gender: string | null) => {
  const storageKey = `profile-image-${gender ?? "default"}`;
  const stored = localStorage.getItem(storageKey);

  if (stored !== null) {
    return parseInt(stored);
  }

  const newIndex = getRandomInt(6) - 1;
  localStorage.setItem(storageKey, newIndex.toString());
  return newIndex;
};

export const getProfileImage = (gender: string | null) => {
  try {
    const imageIndex = getOrSetImageIndex(gender);
    if (gender?.toLowerCase() === "male") {
      return maleImages[imageIndex];
    } else if (gender?.toLowerCase() === "female") {
      return femaleImages[imageIndex];
    }
    return gender === null ? maleImages[imageIndex] : femaleImages[imageIndex];
  } catch {
    return gender?.toLowerCase() === "male" ? maleImages[0] : femaleImages[0];
  }
};
