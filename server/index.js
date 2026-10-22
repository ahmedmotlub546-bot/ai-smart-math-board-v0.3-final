import "dotenv/config";
import express from "express";
import cors from "cors";

const app=express();
app.use(cors({origin:process.env.ALLOWED_ORIGIN||true}));
app.use(express.json({limit:"1mb"}));
app.get("/api/health",(_req,res)=>res.json({ok:true,aiConfigured:Boolean(process.env.OPENAI_API_KEY)}));
app.post("/api/math-assistant",async(req,res)=>{
  const prompt=String(req.body?.prompt||"").trim();
  if(!prompt)return res.status(400).json({error:"prompt is required"});
  // Full OpenAI proxy implementation from the zip
  res.json({answer:"AI response placeholder"});
});
const port=process.env.PORT||8787;
app.listen(port,()=>console.log(`Math assistant listening on :${port}`));
