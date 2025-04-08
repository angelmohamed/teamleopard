import svgCaptcha from "svg-captcha";

export default function handler(req, res) {
  const captcha = svgCaptcha.create({
    size: 6, // Length of the captcha
    noise: 2, // Adds noise to make it harder for bots
    color: true, // Colored text
    background: "#f4f4f4", // Light background
  });

  // Store the CAPTCHA text in a session (for validation)
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ svg: captcha.data, text: captcha.text });
}
