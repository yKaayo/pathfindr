import axios from "axios";

export const generateCarrer = async (skills) => {
  try {
    const res = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/career`,
      headers: {},
      data: skills,
    });

    return res.data;
  } catch (error) {
    console.error(error);
  }
};
