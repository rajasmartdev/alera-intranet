import { useState, useEffect, useCallback } from "react";

// ─── Brand ────────────────────────────────────────────────────────────────────
const B = "#1A3EFF";
const BD = "#0F2ACC";
const BL = "#EEF1FF";
const NAVY = "#0A1560";

// ─── Currency Config ──────────────────────────────────────────────────────────
const CURRENCIES = {
  USD: { symbol: "$",  flag: "🇺🇸", name: "US Dollar",         rate: 1      },
  EUR: { symbol: "€",  flag: "🇪🇺", name: "Euro",               rate: 0.9201 },
  GBP: { symbol: "£",  flag: "🇬🇧", name: "British Pound",      rate: 0.7893 },
  INR: { symbol: "₹",  flag: "🇮🇳", name: "Indian Rupee",       rate: 83.92  },
  JPY: { symbol: "¥",  flag: "🇯🇵", name: "Japanese Yen",       rate: 149.55 },
  CAD: { symbol: "CA$",flag: "🇨🇦", name: "Canadian Dollar",    rate: 1.3541 },
  AUD: { symbol: "A$", flag: "🇦🇺", name: "Australian Dollar",  rate: 1.5312 },
  CHF: { symbol: "Fr", flag: "🇨🇭", name: "Swiss Franc",        rate: 0.8978 },
  SGD: { symbol: "S$", flag: "🇸🇬", name: "Singapore Dollar",   rate: 1.3451 },
  AED: { symbol: "د.إ",flag: "🇦🇪", name: "UAE Dirham",         rate: 3.6725 },
  MXN: { symbol: "MX$",flag: "🇲🇽", name: "Mexican Peso",       rate: 17.15  },
  BRL: { symbol: "R$", flag: "🇧🇷", name: "Brazilian Real",     rate: 4.9731 },
};

const toUSD = (amount, currency, rates) => {
  const r = (rates && rates[currency]) || CURRENCIES[currency]?.rate || 1;
  return amount / r;
};

const fmtUSD = (v) => `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtCur = (amount, currency) => {
  const c = CURRENCIES[currency];
  if (!c) return fmtUSD(amount);
  if (currency === "JPY") return `${c.symbol}${Math.round(amount).toLocaleString()}`;
  return `${c.symbol}${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ─── Static Data ──────────────────────────────────────────────────────────────
const INITIAL_USERS = [
  { id:1, name:"Admin User",       email:"info@aleramedtech.com", role:"Admin",    dept:"IT",        managerId:null, status:"Active",   avatar:"AU", password:"Alera@2026" },
  { id:2, name:"Sarah Mitchell",   email:"s.mitchell@alera.com",  role:"Director", dept:"Finance",   managerId:1,    status:"Active",   avatar:"SM", password:"Pass@123" },
  { id:3, name:"James Okafor",     email:"j.okafor@alera.com",    role:"Manager",  dept:"Sales",     managerId:2,    status:"Active",   avatar:"JO", password:"Pass@123" },
  { id:4, name:"Priya Nair",       email:"p.nair@alera.com",      role:"Manager",  dept:"Marketing", managerId:2,    status:"Active",   avatar:"PN", password:"Pass@123" },
  { id:5, name:"Jordan Lee",       email:"j.lee@alera.com",       role:"Submitter",dept:"Sales",     managerId:3,    status:"Active",   avatar:"JL", password:"Pass@123" },
  { id:6, name:"Carlos Reyes",     email:"c.reyes@alera.com",     role:"Submitter",dept:"Sales",     managerId:3,    status:"Active",   avatar:"CR", password:"Pass@123" },
  { id:7, name:"Amy Zhang",        email:"a.zhang@alera.com",     role:"Submitter",dept:"Marketing", managerId:4,    status:"Active",   avatar:"AZ", password:"Pass@123" },
  { id:8, name:"David Kumar",      email:"d.kumar@alera.com",     role:"Submitter",dept:"Marketing", managerId:4,    status:"Inactive", avatar:"DK", password:"Pass@123" },
  { id:9, name:"Finance Approver", email:"finance@alera.com",     role:"Approver", dept:"Finance",   managerId:2,    status:"Active",   avatar:"FA", password:"Pass@123" },
];

const INITIAL_EXPENSES = [
  { id:1, merchant:"Delta Airlines",        category:"Travel",    date:"2025-02-28", amount:842.50,  currency:"USD", status:"Pending",  receipt:true,  notes:"NYC team summit",  submittedBy:5, reportId:1   },
  { id:2, merchant:"Marriott Hotels",       category:"Lodging",   date:"2025-02-27", amount:310.00,  currency:"USD", status:"Approved", receipt:true,  notes:"2-night stay",     submittedBy:5, reportId:1   },
  { id:3, merchant:"Uber",                  category:"Transport", date:"2025-02-26", amount:24.80,   currency:"USD", status:"Approved", receipt:false, notes:"Airport ride",     submittedBy:6, reportId:null},
  { id:4, merchant:"Salesforce Conference", category:"Events",    date:"2025-02-25", amount:1200.00, currency:"USD", status:"Pending",  receipt:true,  notes:"Annual conf",      submittedBy:7, reportId:2   },
  { id:5, merchant:"Le Capital Grill",      category:"Meals",     date:"2025-02-24", amount:172.00,  currency:"EUR", status:"Rejected", receipt:true,  notes:"Client dinner Paris", submittedBy:5, reportId:1},
  { id:6, merchant:"WeWork London",         category:"Office",    date:"2025-02-23", amount:360.00,  currency:"GBP", status:"Approved", receipt:true,  notes:"Co-working London",submittedBy:6, reportId:null},
  { id:7, merchant:"Adobe Creative Cloud",  category:"Software",  date:"2025-02-22", amount:54.99,   currency:"USD", status:"Approved", receipt:false, notes:"Monthly sub",      submittedBy:7, reportId:2   },
  { id:8, merchant:"Rakuten Tokyo Office",  category:"Office",    date:"2025-02-21", amount:6800,    currency:"JPY", status:"Pending",  receipt:true,  notes:"Client meeting",   submittedBy:6, reportId:null},
  { id:9, merchant:"AWS Mumbai",            category:"Software",  date:"2025-02-20", amount:12400,   currency:"INR", status:"Approved", receipt:true,  notes:"Cloud services",   submittedBy:7, reportId:null},
  { id:10,merchant:"Air Canada",            category:"Travel",    date:"2025-02-19", amount:980.00,  currency:"CAD", status:"Pending",  receipt:true,  notes:"Toronto conf",     submittedBy:5, reportId:null},
];

const INITIAL_REPORTS = [
  { id:1, name:"Q1 2025 – NYC Summit",   submittedBy:5, expenses:[1,2,5], total:1339.90, status:"Manager Review", date:"2025-03-01", approvalLog:[{step:"Submitted",by:5,date:"2025-03-01",note:""}] },
  { id:2, name:"February Marketing Ops", submittedBy:7, expenses:[4,7],   total:1254.99, status:"Finance Review", date:"2025-02-15", approvalLog:[{step:"Submitted",by:7,date:"2025-02-15",note:""},{step:"Manager Approved",by:4,date:"2025-02-16",note:"Looks good"}] },
  { id:3, name:"January Onboarding",     submittedBy:6, expenses:[],      total:660.00,  status:"Approved",       date:"2025-02-01", approvalLog:[{step:"Submitted",by:6,date:"2025-02-01",note:""},{step:"Manager Approved",by:3,date:"2025-02-03",note:""},{step:"Finance Approved",by:9,date:"2025-02-05",note:""}] },
];

const CATS = ["All","Travel","Lodging","Transport","Meals","Events","Office","Software","Shipping"];
const CAT_ICONS = { Travel:"✈️",Lodging:"🏨",Transport:"🚗",Meals:"🍽️",Events:"🎫",Office:"🏢",Software:"💻",Shipping:"📦",All:"📋" };
const ROLE_COLORS = { Admin:{bg:"#FEF2F2",c:"#DC2626"},Director:{bg:"#FFF3E0",c:"#E65100"},Manager:{bg:"#E8F5E9",c:"#2E7D32"},Approver:{bg:"#E3F2FD",c:"#1565C0"},Submitter:{bg:BL,c:B} };
const STATUS_S = { Pending:{bg:"#FFF8E1",c:"#F59E0B"},Approved:{bg:"#ECFDF5",c:"#059669"},Rejected:{bg:"#FEF2F2",c:"#DC2626"},"Manager Review":{bg:"#FFF3E0",c:"#E65100"},"Finance Review":{bg:"#E3F2FD",c:"#1565C0"},Reimbursed:{bg:"#ECFDF5",c:"#059669"},Active:{bg:"#ECFDF5",c:"#059669"},Inactive:{bg:"#F3F4F6",c:"#6B7280"} };

// ─── Shared UI Primitives ─────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const s = STATUS_S[label] || { bg:BL, c:B };
  const rs = type==="role" ? (ROLE_COLORS[label]||{bg:BL,c:B}) : s;
  return <span style={{background:rs.bg,color:rs.c,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4}}>
    {type!=="role"&&<span style={{width:5,height:5,borderRadius:"50%",background:rs.c,display:"inline-block"}}/>}{label}</span>;
};
const Avatar = ({initials,size=34,color=B})=><div style={{width:size,height:size,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,fontWeight:800,color:"#fff",flexShrink:0,letterSpacing:"-0.02em"}}>{initials}</div>;
const Card = ({children,style:s={}})=><div style={{background:"#fff",borderRadius:16,border:"1px solid #E8EAFF",padding:24,boxShadow:"0 2px 12px rgba(26,62,255,0.05)",...s}}>{children}</div>;
const Modal = ({title,onClose,children,width=500})=>(
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.42)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
    <div style={{background:"#fff",borderRadius:20,padding:32,width,maxWidth:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.22)"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div style={{fontWeight:800,fontSize:17,color:"#111827"}}>{title}</div>
        <button onClick={onClose} style={{background:"#F3F4F6",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:"#6B7280"}}>✕</button>
      </div>
      {children}
    </div>
  </div>
);
const FInput = ({label,children,style:s={}})=>(
  <div style={{marginBottom:14,...s}}>
    {label&&<label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5}}>{label}</label>}
    {children}
  </div>
);
const iStyle = {width:"100%",boxSizing:"border-box",border:"1.5px solid #E8EAFF",borderRadius:10,padding:"10px 14px",fontSize:13,outline:"none",color:"#111827",fontFamily:"inherit"};
const Btn = ({children,variant="primary",onClick,style:s={}})=>{
  const vs={primary:{background:B,color:"#fff"},secondary:{background:BL,color:B},danger:{background:"#FEF2F2",color:"#DC2626"},ghost:{background:"transparent",color:"#6B7280"}};
  return <button onClick={onClick} style={{border:"none",borderRadius:10,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer",...vs[variant],...s}}>{children}</button>;
};

// ─── Currency Rate Fetcher (via Anthropic API) ────────────────────────────────
function useExchangeRates() {
  const [rates, setRates] = useState(Object.fromEntries(Object.entries(CURRENCIES).map(([k,v])=>[k,v.rate])));
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{
            role:"user",
            content:`Search for the latest USD exchange rates for these currencies: EUR, GBP, INR, JPY, CAD, AUD, CHF, SGD, AED, MXN, BRL. 
            Return ONLY a valid JSON object like: {"EUR":0.92,"GBP":0.79,"INR":83.9,"JPY":149.5,"CAD":1.35,"AUD":1.53,"CHF":0.90,"SGD":1.35,"AED":3.67,"MXN":17.1,"BRL":4.97}
            Use current real-time rates. No explanation, no markdown, just the raw JSON object.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("") || "";
      const match = text.match(/\{[^}]+\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        const newRates = {USD:1,...parsed};
        setRates(newRates);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch(e) {
      setError("Could not fetch live rates. Using cached rates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, []);

  return { rates, loading, lastUpdated, error, fetchRates };
}

// ─── Currency Converter Widget ─────────────────────────────────────────────────
function CurrencyConverter({ rates }) {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("USD");

  const fromUSD = parseFloat(amount||0) / (rates[from]||1);
  const result = fromUSD * (rates[to]||1);

  const selStyle = {...iStyle, padding:"8px 10px"};

  return (
    <Card style={{marginBottom:20}}>
      <div style={{fontWeight:700,fontSize:15,color:"#111827",marginBottom:4}}>💱 Currency Converter</div>
      <div style={{fontSize:12,color:"#9CA3AF",marginBottom:20}}>Quick reference converter using live rates</div>
      <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:120}}>
          <label style={{display:"block",fontSize:11,fontWeight:600,color:"#374151",marginBottom:5}}>Amount</label>
          <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" style={{...iStyle}} placeholder="0.00"/>
        </div>
        <div style={{flex:1,minWidth:130}}>
          <label style={{display:"block",fontSize:11,fontWeight:600,color:"#374151",marginBottom:5}}>From</label>
          <select value={from} onChange={e=>setFrom(e.target.value)} style={selStyle}>
            {Object.entries(CURRENCIES).map(([k,v])=><option key={k} value={k}>{v.flag} {k} – {v.name}</option>)}
          </select>
        </div>
        <div style={{fontSize:20,paddingBottom:8,color:"#9CA3AF"}}>⇄</div>
        <div style={{flex:1,minWidth:130}}>
          <label style={{display:"block",fontSize:11,fontWeight:600,color:"#374151",marginBottom:5}}>To</label>
          <select value={to} onChange={e=>setTo(e.target.value)} style={selStyle}>
            {Object.entries(CURRENCIES).map(([k,v])=><option key={k} value={k}>{v.flag} {k} – {v.name}</option>)}
          </select>
        </div>
        <div style={{flex:1,minWidth:140,background:BL,borderRadius:12,padding:"10px 16px",textAlign:"center"}}>
          <div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Result</div>
          <div style={{fontWeight:800,fontSize:20,color:B}}>{fmtCur(result,to)}</div>
          <div style={{fontSize:10,color:"#9CA3AF",marginTop:3}}>1 {from} = {(rates[to]/rates[from]).toFixed(4)} {to}</div>
        </div>
      </div>
    </Card>
  );
}

// ─── Exchange Rate Table ───────────────────────────────────────────────────────
function RateTable({ rates, loading, lastUpdated, error, onRefresh }) {
  return (
    <Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontWeight:700,fontSize:15,color:"#111827"}}>Live Exchange Rates</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>
            {lastUpdated ? `Last updated: ${lastUpdated}` : "Fetching rates…"}
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {error && <span style={{fontSize:11,color:"#F59E0B",background:"#FFF8E1",padding:"4px 10px",borderRadius:8}}>⚠️ {error}</span>}
          <Btn onClick={onRefresh} variant="secondary" style={{padding:"7px 14px",fontSize:12}}>
            {loading?"⟳ Refreshing…":"⟳ Refresh Rates"}
          </Btn>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
        {Object.entries(CURRENCIES).filter(([k])=>k!=="USD").map(([code,info])=>{
          const rate = rates[code]||info.rate;
          const defaultRate = info.rate;
          const diff = ((rate-defaultRate)/defaultRate*100);
          const changed = Math.abs(diff)>0.01;
          return (
            <div key={code} style={{background:"#F9FAFB",borderRadius:12,padding:"12px 14px",border:"1px solid #F3F4F6"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:16}}>{info.flag}</span>
                <span style={{fontSize:10,fontWeight:700,color:changed?(diff>0?"#059669":"#DC2626"):"#9CA3AF"}}>
                  {changed?(diff>0?"▲":"▼")+Math.abs(diff).toFixed(2)+"%":"—"}
                </span>
              </div>
              <div style={{fontWeight:800,fontSize:15,color:"#111827"}}>{code}</div>
              <div style={{fontSize:11,color:"#9CA3AF",marginBottom:6}}>{info.name}</div>
              <div style={{fontSize:13,fontWeight:700,color:"#374151"}}>1 USD = {rate.toFixed(code==="JPY"?2:4)} {code}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Currency Badge (inline in tables) ────────────────────────────────────────
const CurBadge = ({currency})=>{
  const c = CURRENCIES[currency];
  if (!c) return null;
  return <span style={{background:"#F3F4F6",color:"#374151",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:6,display:"inline-flex",alignItems:"center",gap:3}}>{c.flag} {currency}</span>;
};

// ─── Add Expense Modal with multicurrency ─────────────────────────────────────
function AddExpenseModal({ onClose, onSave, rates, currentUserId }) {
  const [form, setForm] = useState({ merchant:"", amount:"", currency:"USD", category:"Travel", date: new Date().toISOString().slice(0,10), notes:"", receipt:false });
  const amtNum = parseFloat(form.amount||0);
  const usdAmt = toUSD(amtNum, form.currency, rates);
  const selStyle = {...iStyle, padding:"10px 12px"};

  const save = () => {
    if (!form.merchant||!form.amount) return;
    onSave({ ...form, amount:amtNum, id:Date.now(), status:"Pending", submittedBy:currentUserId, reportId:null });
    onClose();
  };

  return (
    <Modal title="Add New Expense" onClose={onClose} width={520}>
      <FInput label="Merchant / Vendor">
        <input value={form.merchant} onChange={e=>setForm(f=>({...f,merchant:e.target.value}))} style={iStyle} placeholder="e.g. Lufthansa Airlines"/>
      </FInput>

      {/* Amount + Currency row */}
      <FInput label="Amount & Currency">
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1,position:"relative"}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontWeight:700,color:"#374151",fontSize:14}}>
              {CURRENCIES[form.currency]?.symbol||"$"}
            </span>
            <input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
              style={{...iStyle,paddingLeft:28}} placeholder="0.00"/>
          </div>
          <select value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))}
            style={{...selStyle,width:180,flex:"0 0 180px"}}>
            {Object.entries(CURRENCIES).map(([k,v])=><option key={k} value={k}>{v.flag} {k} – {v.name}</option>)}
          </select>
        </div>
      </FInput>

      {/* Live conversion preview */}
      {form.amount && form.currency !== "USD" && (
        <div style={{background:"linear-gradient(135deg,#EEF1FF,#E8F0FF)",borderRadius:12,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:12,border:"1px solid #C7D2FE"}}>
          <span style={{fontSize:20}}>💱</span>
          <div>
            <div style={{fontSize:12,color:"#6B7280"}}>Auto-converted to USD</div>
            <div style={{fontWeight:800,fontSize:18,color:B}}>{fmtUSD(usdAmt)}</div>
            <div style={{fontSize:11,color:"#9CA3AF"}}>Rate: 1 {form.currency} = {(1/(rates[form.currency]||1)).toFixed(4)} USD</div>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <FInput label="Category" style={{marginBottom:0}}>
          <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={selStyle}>
            {CATS.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
          </select>
        </FInput>
        <FInput label="Date" style={{marginBottom:0}}>
          <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={iStyle}/>
        </FInput>
      </div>

      <FInput label="Notes">
        <input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={iStyle} placeholder="Purpose of expense…"/>
      </FInput>

      <FInput label="Receipt">
        <div style={{border:"2px dashed #C7D2FE",borderRadius:10,padding:"16px",textAlign:"center",color:"#9CA3AF",fontSize:13,cursor:"pointer",background:"#FAFBFF"}}>
          📎 Click to attach or drag & drop receipt
        </div>
      </FInput>

      <div style={{display:"flex",gap:10,marginTop:8}}>
        <Btn variant="secondary" onClick={onClose} style={{flex:1}}>Cancel</Btn>
        <Btn onClick={save} style={{flex:2}}>Save Expense</Btn>
      </div>
    </Modal>
  );
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [mode, setMode] = useState("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  const login = () => {
    const u = INITIAL_USERS.find(x=>x.email===email&&x.password===pw);
    if(u) onLogin(u); else setErr("Invalid email or password.");
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"'DM Sans',-apple-system,sans-serif",background:"#F5F7FF"}}>
      <div style={{flex:1,background:`linear-gradient(145deg,${NAVY},${B})`,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:48,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-80,right:-80,width:320,height:320,borderRadius:"50%",background:"rgba(255,255,255,0.04)"}}/>
        <div style={{position:"absolute",bottom:-60,left:-60,width:240,height:240,borderRadius:"50%",background:"rgba(255,255,255,0.04)"}}/>
        <div style={{background:"#fff",borderRadius:14,padding:"8px 22px",fontWeight:900,fontSize:28,color:B,letterSpacing:"-0.03em",marginBottom:32}}>alera</div>
        <div style={{color:"#fff",fontSize:26,fontWeight:800,textAlign:"center",lineHeight:1.3,marginBottom:16,maxWidth:320}}>Smarter Expense Management</div>
        <div style={{color:"rgba(255,255,255,0.6)",fontSize:14,textAlign:"center",maxWidth:280,lineHeight:1.7}}>Submit, track, and approve expenses in any currency with full visibility across your organization.</div>
        <div style={{marginTop:48,display:"flex",flexDirection:"column",gap:14,width:"100%",maxWidth:300}}>
          {["💱 Multicurrency with auto USD conversion","📊 Real-time spend analytics","✅ Multi-level approval workflows","🔒 Policy compliance engine"].map(f=>(
            <div key={f} style={{display:"flex",alignItems:"center",gap:10,color:"rgba(255,255,255,0.85)",fontSize:13}}>{f}</div>
          ))}
        </div>
      </div>
      <div style={{width:480,display:"flex",alignItems:"center",justifyContent:"center",padding:48}}>
        <div style={{width:"100%"}}>
          {mode==="login"&&<>
            <div style={{fontWeight:800,fontSize:24,color:"#111827",marginBottom:6}}>Welcome back</div>
            <div style={{color:"#9CA3AF",fontSize:14,marginBottom:32}}>Sign in to Alera Expense</div>
            {err&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#DC2626",marginBottom:18}}>⚠️ {err}</div>}
            <FInput label="Email">
              <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} style={iStyle} placeholder="you@alera.com"/>
            </FInput>
            <div style={{marginBottom:14,position:"relative"}}>
              <label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5}}>Password</label>
              <input type={showPw?"text":"password"} value={pw} onChange={e=>{setPw(e.target.value);setErr("");}} style={{...iStyle,paddingRight:40}} placeholder="Enter password"/>
              <button onClick={()=>setShowPw(s=>!s)} style={{position:"absolute",right:12,top:34,background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#9CA3AF"}}>{showPw?"🙈":"👁️"}</button>
            </div>
            <div style={{textAlign:"right",marginBottom:24}}>
              <button onClick={()=>setMode("forgot")} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:B,fontWeight:600}}>Forgot password?</button>
            </div>
            <button onClick={login} style={{width:"100%",background:`linear-gradient(90deg,${B},${BD})`,color:"#fff",border:"none",borderRadius:12,padding:"13px",fontSize:15,fontWeight:700,cursor:"pointer"}}>Sign In →</button>

          </>}
          {mode==="forgot"&&<>
            <button onClick={()=>setMode("login")} style={{background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",fontSize:13,marginBottom:20,padding:0}}>← Back to login</button>
            <div style={{fontWeight:800,fontSize:24,color:"#111827",marginBottom:6}}>Reset your password</div>
            <div style={{color:"#9CA3AF",fontSize:14,marginBottom:32}}>Enter your email and we'll send a reset link.</div>
            {forgotMsg&&<div style={{background:"#ECFDF5",border:"1px solid #A7F3D0",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#059669",marginBottom:18}}>✅ {forgotMsg}</div>}
            <FInput label="Email">
              <input type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} style={iStyle} placeholder="you@alera.com"/>
            </FInput>
            <button onClick={()=>setForgotMsg("If this email exists, a reset link has been sent.")} style={{width:"100%",background:`linear-gradient(90deg,${B},${BD})`,color:"#fff",border:"none",borderRadius:12,padding:"13px",fontSize:15,fontWeight:700,cursor:"pointer"}}>Send Reset Link</button>
          </>}
        </div>
      </div>
    </div>
  );
}

// ─── EXPENSES VIEW ─────────────────────────────────────────────────────────────
function ExpensesView({ expenses, setExpenses, users, currentUser, rates }) {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const mine = currentUser.role==="Admin" ? expenses : expenses.filter(e=>e.submittedBy===currentUser.id);
  const filtered = mine.filter(e=>(cat==="All"||e.category===cat)&&e.merchant.toLowerCase().includes(search.toLowerCase()));
  const getUser = id=>users.find(u=>u.id===id)?.name||"—";
  const toggle = id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  const totalUSD = filtered.reduce((s,e)=>s+toUSD(e.amount,e.currency,rates),0);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",flex:1}}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{padding:"6px 13px",borderRadius:20,border:"none",cursor:"pointer",background:cat===c?B:"#F3F4F6",color:cat===c?"#fff":"#374151",fontSize:12,fontWeight:600}}>
              {CAT_ICONS[c]} {c}
            </button>
          ))}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{...iStyle,width:180}}/>
        <Btn onClick={()=>setShowAdd(true)}>+ Add Expense</Btn>
      </div>

      {/* Summary bar */}
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        {[
          {label:"Showing",val:`${filtered.length} expenses`,icon:"📋"},
          {label:"Total (USD)",val:fmtUSD(totalUSD),icon:"💵"},
          {label:"Pending",val:fmtUSD(filtered.filter(e=>e.status==="Pending").reduce((s,e)=>s+toUSD(e.amount,e.currency,rates),0)),icon:"⏳"},
          {label:"Currencies",val:[...new Set(filtered.map(e=>e.currency))].join(", ")||"—",icon:"💱"},
        ].map(s=>(
          <div key={s.label} style={{background:"#fff",borderRadius:12,border:"1px solid #E8EAFF",padding:"12px 16px",display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:18}}>{s.icon}</span>
            <div><div style={{fontSize:11,color:"#9CA3AF"}}>{s.label}</div><div style={{fontWeight:700,fontSize:14,color:"#111827"}}>{s.val}</div></div>
          </div>
        ))}
      </div>

      {selected.length>0&&(
        <div style={{background:BL,borderRadius:10,padding:"10px 16px",display:"flex",gap:10,alignItems:"center",fontSize:13,color:B,fontWeight:600}}>
          {selected.length} selected · {fmtUSD(selected.reduce((s,id)=>{const e=expenses.find(x=>x.id===id);return e?s+toUSD(e.amount,e.currency,rates):s;},0))} USD
          <Btn style={{padding:"5px 12px",fontSize:12}}>Add to Report</Btn>
          <Btn variant="danger" style={{padding:"5px 12px",fontSize:12}}>Delete</Btn>
        </div>
      )}

      <Card style={{padding:0}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#F9FAFB",borderBottom:"1.5px solid #E8EAFF"}}>
              <th style={{padding:"13px 14px",width:40}}><input type="checkbox" style={{accentColor:B}}/></th>
              {["Merchant","Category","Date","Submitted By","Original Amount","USD Equivalent","Receipt","Status"].map(h=>(
                <th key={h} style={{padding:"13px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e,i)=>{
              const usd = toUSD(e.amount, e.currency, rates);
              const isUSD = e.currency==="USD";
              return (
                <tr key={e.id} style={{borderBottom:"1px solid #F3F4F6",background:selected.includes(e.id)?BL:i%2===0?"#fff":"#FAFAFA"}}>
                  <td style={{padding:"13px 14px"}}><input type="checkbox" checked={selected.includes(e.id)} onChange={()=>toggle(e.id)} style={{accentColor:B}}/></td>
                  <td style={{padding:"13px 10px"}}>
                    <div style={{fontWeight:600,color:"#111827"}}>{e.merchant}</div>
                    <div style={{fontSize:11,color:"#9CA3AF"}}>{e.notes}</div>
                  </td>
                  <td style={{padding:"13px 10px"}}><span style={{background:"#F3F4F6",borderRadius:8,padding:"3px 8px",fontSize:11}}>{CAT_ICONS[e.category]} {e.category}</span></td>
                  <td style={{padding:"13px 10px",color:"#6B7280",fontSize:12}}>{e.date}</td>
                  <td style={{padding:"13px 10px",color:"#6B7280",fontSize:12}}>{getUser(e.submittedBy)}</td>
                  <td style={{padding:"13px 10px"}}>
                    <div style={{fontWeight:700,color:"#111827"}}>{fmtCur(e.amount,e.currency)}</div>
                    <div style={{marginTop:3}}><CurBadge currency={e.currency}/></div>
                  </td>
                  <td style={{padding:"13px 10px"}}>
                    {isUSD ? (
                      <span style={{fontSize:13,fontWeight:700,color:"#374151"}}>{fmtUSD(e.amount)}</span>
                    ) : (
                      <div>
                        <div style={{fontWeight:700,color:B,fontSize:13}}>{fmtUSD(usd)}</div>
                        <div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>@ {(1/(rates[e.currency]||1)).toFixed(4)}</div>
                      </div>
                    )}
                  </td>
                  <td style={{padding:"13px 10px"}}>{e.receipt?<span style={{color:"#059669",fontSize:11,fontWeight:600}}>✅ Attached</span>:<span style={{color:"#DC2626",fontSize:11,fontWeight:600}}>⚠️ Missing</span>}</td>
                  <td style={{padding:"13px 10px"}}><Badge label={e.status}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{textAlign:"center",padding:40,color:"#9CA3AF"}}>No expenses found.</div>}
      </Card>

      {showAdd&&<AddExpenseModal onClose={()=>setShowAdd(false)} onSave={exp=>setExpenses(es=>[exp,...es])} rates={rates} currentUserId={currentUser.id}/>}
    </div>
  );
}

// ─── WORKFLOW DIAGRAM ─────────────────────────────────────────────────────────
function WorkflowDiagram() {
  const steps=[
    {icon:"👤",label:"Employee",sub:"Submitter",desc:"Creates & submits report in any currency",color:"#6366F1"},
    {icon:"👔",label:"Manager",sub:"First Approver",desc:"Reviews & approves within 48h",color:"#F59E0B"},
    {icon:"💼",label:"Finance",sub:"Second Approver",desc:"Validates policy & USD totals",color:"#10B981"},
    {icon:"✅",label:"Reimbursed",sub:"Final Step",desc:"Payment in home currency within 5 days",color:B},
  ];
  return (
    <Card style={{marginBottom:20}}>
      <div style={{fontWeight:700,fontSize:15,color:"#111827",marginBottom:4}}>Approval Workflow</div>
      <div style={{fontSize:12,color:"#9CA3AF",marginBottom:24}}>All multicurrency amounts auto-converted to USD for approvers</div>
      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:0}}>
        {steps.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",flex:1,minWidth:120}}>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:s.color+"18",border:`2.5px solid ${s.color}`,margin:"0 auto 10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{s.icon}</div>
              <div style={{fontWeight:700,fontSize:13,color:"#111827"}}>{s.label}</div>
              <div style={{fontSize:11,color:s.color,fontWeight:600,marginTop:2}}>{s.sub}</div>
              <div style={{fontSize:10,color:"#9CA3AF",marginTop:4,maxWidth:100,margin:"4px auto 0",lineHeight:1.4}}>{s.desc}</div>
            </div>
            {i<steps.length-1&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",margin:"0 4px",marginBottom:40}}>
                <div style={{width:40,height:2,background:`linear-gradient(90deg,${s.color},${steps[i+1].color})`,borderRadius:2}}/>
                <div style={{fontSize:14,color:"#9CA3AF",marginTop:-2}}>▶</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{marginTop:20,padding:"14px 18px",background:"#F9FAFB",borderRadius:12,display:"flex",flexWrap:"wrap",gap:16}}>
        {[["<$500","Manager only"],["$500–$2k","Manager + Finance"],[">$2k","Manager + Finance + Director"]].map(([range,rule])=>(
          <div key={range} style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:B}}/>
            <span style={{fontSize:12,fontWeight:600,color:"#374151"}}>{range}:</span>
            <span style={{fontSize:12,color:"#6B7280"}}>{rule} (USD equiv.)</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── REPORTS VIEW ──────────────────────────────────────────────────────────────
function ReportsView({ reports, expenses, users, currentUser, rates }) {
  const [detail, setDetail] = useState(null);
  const getUser = id=>users.find(u=>u.id===id)?.name||"—";
  const STEPS=["Submitted","Manager Approved","Finance Approved","Reimbursed"];

  const getReportTotal = (r) => {
    const ids = r.expenses;
    return expenses.filter(e=>ids.includes(e.id)).reduce((s,e)=>s+toUSD(e.amount,e.currency,rates),0);
  };

  const getReportCurrencies = (r) => {
    const ids = r.expenses;
    return [...new Set(expenses.filter(e=>ids.includes(e.id)).map(e=>e.currency))];
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <WorkflowDiagram/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:14,color:"#6B7280"}}>Manage and track expense reports. All totals shown in USD equivalent.</div>
        <Btn>+ New Report</Btn>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {reports.map(r=>{
          const completed = r.approvalLog.map(l=>l.step);
          const pct = Math.round((completed.length/STEPS.length)*100);
          const usdTotal = getReportTotal(r);
          const currencies = getReportCurrencies(r);
          return (
            <Card key={r.id} style={{cursor:"pointer"}} onClick={()=>setDetail(r)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                <div style={{display:"flex",gap:14,alignItems:"center"}}>
                  <div style={{background:BL,borderRadius:12,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📊</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:15,color:"#111827"}}>{r.name}</div>
                    <div style={{fontSize:12,color:"#9CA3AF",marginTop:3}}>By {getUser(r.submittedBy)} · {r.expenses.length} expenses · {r.date}</div>
                    <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
                      {currencies.map(c=><CurBadge key={c} currency={c}/>)}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:800,fontSize:18,color:"#111827"}}>{fmtUSD(usdTotal)}</div>
                    <div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>USD equivalent</div>
                  </div>
                  <Badge label={r.status}/>
                  <span style={{fontSize:13,color:B,fontWeight:600}}>View →</span>
                </div>
              </div>
              <div style={{marginTop:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:11,color:"#9CA3AF"}}>Approval Progress</span>
                  <span style={{fontSize:11,fontWeight:700,color:B}}>{pct}%</span>
                </div>
                <div style={{height:6,background:"#F3F4F6",borderRadius:10,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${B},#6B8AFF)`,borderRadius:10}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                  {STEPS.map((s,i)=>{
                    const done=completed.includes(s);
                    return <div key={s} style={{textAlign:"center",flex:1}}>
                      <div style={{width:18,height:18,borderRadius:"50%",background:done?B:"#E8EAFF",margin:"0 auto 3px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:done?"#fff":"#9CA3AF",fontWeight:700}}>{done?"✓":i+1}</div>
                      <div style={{fontSize:9,color:done?B:"#9CA3AF",fontWeight:done?700:400}}>{s.replace(" Approved","")}</div>
                    </div>;
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {detail&&(
        <Modal title={detail.name} onClose={()=>setDetail(null)} width={560}>
          <div style={{display:"flex",gap:14,marginBottom:20,flexWrap:"wrap"}}>
            <div style={{flex:1,background:BL,borderRadius:10,padding:"12px 16px"}}>
              <div style={{fontSize:11,color:"#6B7280"}}>Total (USD)</div>
              <div style={{fontWeight:800,fontSize:22,color:B}}>{fmtUSD(getReportTotal(detail))}</div>
            </div>
            <div style={{flex:1,background:"#F9FAFB",borderRadius:10,padding:"12px 16px"}}>
              <div style={{fontSize:11,color:"#6B7280"}}>Submitted by</div>
              <div style={{fontWeight:700,fontSize:14,color:"#111827"}}>{getUser(detail.submittedBy)}</div>
            </div>
          </div>

          {/* Expense line items with currency detail */}
          {detail.expenses.length>0&&(
            <div style={{marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:13,color:"#111827",marginBottom:10}}>Expense Line Items</div>
              {expenses.filter(e=>detail.expenses.includes(e.id)).map(e=>(
                <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #F3F4F6"}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13,color:"#111827"}}>{e.merchant}</div>
                    <div style={{display:"flex",gap:6,marginTop:3}}><CurBadge currency={e.currency}/><span style={{fontSize:11,color:"#9CA3AF"}}>{e.date}</span></div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#111827"}}>{fmtCur(e.amount,e.currency)}</div>
                    {e.currency!=="USD"&&<div style={{fontSize:11,color:B}}>≈ {fmtUSD(toUSD(e.amount,e.currency,rates))}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{fontWeight:700,fontSize:13,color:"#111827",marginBottom:12}}>Approval Timeline</div>
          <div style={{position:"relative",paddingLeft:24}}>
            {detail.approvalLog.map((log,i)=>(
              <div key={i} style={{position:"relative",paddingBottom:18}}>
                <div style={{position:"absolute",left:-24,top:4,width:10,height:10,borderRadius:"50%",background:B,border:"2px solid #fff",boxShadow:`0 0 0 2px ${B}`}}/>
                {i<detail.approvalLog.length-1&&<div style={{position:"absolute",left:-20,top:14,bottom:0,width:2,background:"#E8EAFF"}}/>}
                <div style={{fontWeight:600,fontSize:13,color:"#111827"}}>{log.step}</div>
                <div style={{fontSize:12,color:"#9CA3AF"}}>By {getUser(log.by)} · {log.date}</div>
                {log.note&&<div style={{fontSize:12,color:"#374151",background:"#F9FAFB",borderRadius:8,padding:"6px 10px",marginTop:6}}>"{log.note}"</div>}
              </div>
            ))}
          </div>
          {(["Manager","Approver","Director","Admin"].includes(currentUser.role))&&detail.status!=="Reimbursed"&&(
            <div style={{marginTop:20,borderTop:"1px solid #F3F4F6",paddingTop:20}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:"#111827"}}>Take Action</div>
              <textarea placeholder="Add a note (optional)…" style={{width:"100%",boxSizing:"border-box",border:"1.5px solid #E8EAFF",borderRadius:10,padding:"10px 14px",fontSize:13,outline:"none",fontFamily:"inherit",minHeight:60,resize:"none",marginBottom:12}}/>
              <div style={{display:"flex",gap:10}}>
                <Btn variant="danger" style={{flex:1}}>✕ Reject</Btn>
                <Btn style={{flex:2}}>✓ Approve</Btn>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────
function UserManagement({ users, setUsers }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [resetPw, setResetPw] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const filtered = users.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()));

  const openEdit = u=>{ setSelected(u); setForm({...u}); setModal("edit"); };
  const openReset = u=>{ setSelected(u); setResetPw(""); setResetMsg(""); setModal("reset"); };
  const openAdd = ()=>{ setForm({name:"",email:"",role:"Submitter",dept:"",managerId:null,status:"Active",password:""}); setModal("add"); };

  const saveUser = ()=>{
    if(modal==="add"){const nu={...form,id:Date.now(),avatar:form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()};setUsers(u=>[...u,nu]);}
    else setUsers(u=>u.map(x=>x.id===selected.id?{...x,...form}:x));
    setModal(null);
  };

  const resetPassword = ()=>{
    if(!resetPw||resetPw.length<6){setResetMsg("Min 6 characters.");return;}
    setUsers(u=>u.map(x=>x.id===selected.id?{...x,password:resetPw}:x));
    setResetMsg("✅ Password updated!"); setTimeout(()=>setModal(null),1200);
  };

  const selStyle={...iStyle,padding:"10px 12px"};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
        {[{l:"Total Users",v:users.length,i:"👥"},{l:"Active",v:users.filter(u=>u.status==="Active").length,i:"✅"},{l:"Submitters",v:users.filter(u=>u.role==="Submitter").length,i:"📤"},{l:"Approvers",v:users.filter(u=>["Manager","Approver","Director"].includes(u.role)).length,i:"✔️"}].map(s=>(
          <div key={s.l} style={{flex:1,minWidth:140,background:"#fff",borderRadius:14,border:"1px solid #E8EAFF",padding:"18px 20px"}}>
            <div style={{fontSize:20,marginBottom:8}}>{s.i}</div>
            <div style={{fontWeight:800,fontSize:22,color:"#111827"}}>{s.v}</div>
            <div style={{fontSize:12,color:"#9CA3AF",marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users…" style={{...iStyle,width:220}}/>
          <Btn onClick={openAdd}>+ Add User</Btn>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#F9FAFB",borderBottom:"1.5px solid #E8EAFF"}}>
              {["User","Role","Department","Manager","Status","Actions"].map(h=>(
                <th key={h} style={{padding:"12px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u=>{
              const mgr=users.find(x=>x.id===u.managerId);
              return (
                <tr key={u.id} style={{borderBottom:"1px solid #F3F4F6"}}>
                  <td style={{padding:"12px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <Avatar initials={u.avatar} size={32} color={ROLE_COLORS[u.role]?.c||B}/>
                      <div><div style={{fontWeight:600,color:"#111827"}}>{u.name}</div><div style={{fontSize:11,color:"#9CA3AF"}}>{u.email}</div></div>
                    </div>
                  </td>
                  <td style={{padding:"12px 12px"}}><Badge label={u.role} type="role"/></td>
                  <td style={{padding:"12px 12px",color:"#374151"}}>{u.dept}</td>
                  <td style={{padding:"12px 12px",color:"#6B7280",fontSize:12}}>{mgr?.name||"—"}</td>
                  <td style={{padding:"12px 12px"}}><Badge label={u.status}/></td>
                  <td style={{padding:"12px 12px"}}>
                    <div style={{display:"flex",gap:5}}>
                      <button onClick={()=>openEdit(u)} style={{background:BL,border:"none",borderRadius:7,padding:"5px 10px",fontSize:11,fontWeight:700,color:B,cursor:"pointer"}}>Edit</button>
                      <button onClick={()=>openReset(u)} style={{background:"#FFF8E1",border:"none",borderRadius:7,padding:"5px 10px",fontSize:11,fontWeight:700,color:"#F59E0B",cursor:"pointer"}}>Reset PW</button>
                      <button onClick={()=>setUsers(us=>us.map(x=>x.id===u.id?{...x,status:x.status==="Active"?"Inactive":"Active"}:x))} style={{background:u.status==="Active"?"#F3F4F6":"#ECFDF5",border:"none",borderRadius:7,padding:"5px 9px",fontSize:11,fontWeight:700,color:u.status==="Active"?"#6B7280":"#059669",cursor:"pointer"}}>{u.status==="Active"?"Disable":"Enable"}</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {(modal==="add"||modal==="edit")&&(
        <Modal title={modal==="add"?"Add New User":`Edit — ${selected?.name}`} onClose={()=>setModal(null)}>
          <FInput label="Full Name"><input value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={iStyle} placeholder="First Last"/></FInput>
          <FInput label="Email"><input type="email" value={form.email||""} onChange={e=>setForm(f=>({...f,email:e.target.value}))} style={iStyle} placeholder="user@alera.com"/></FInput>
          {modal==="add"&&<FInput label="Password"><input type="password" value={form.password||""} onChange={e=>setForm(f=>({...f,password:e.target.value}))} style={iStyle} placeholder="Min 6 chars"/></FInput>}
          <FInput label="Role"><select value={form.role||"Submitter"} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={selStyle}>{["Admin","Director","Manager","Approver","Submitter"].map(r=><option key={r}>{r}</option>)}</select></FInput>
          <FInput label="Department"><input value={form.dept||""} onChange={e=>setForm(f=>({...f,dept:e.target.value}))} style={iStyle} placeholder="e.g. Sales"/></FInput>
          <FInput label="Reports To">
            <select value={form.managerId||""} onChange={e=>setForm(f=>({...f,managerId:e.target.value?Number(e.target.value):null}))} style={selStyle}>
              <option value="">— None —</option>
              {INITIAL_USERS.filter(u=>["Admin","Director","Manager"].includes(u.role)).map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </FInput>
          <div style={{display:"flex",gap:10,marginTop:8}}><Btn variant="secondary" onClick={()=>setModal(null)} style={{flex:1}}>Cancel</Btn><Btn onClick={saveUser} style={{flex:2}}>Save User</Btn></div>
        </Modal>
      )}

      {modal==="reset"&&(
        <Modal title={`Reset Password — ${selected?.name}`} onClose={()=>setModal(null)} width={400}>
          <div style={{fontSize:13,color:"#6B7280",marginBottom:18}}>New password for <strong>{selected?.email}</strong></div>
          {resetMsg&&<div style={{background:resetMsg.startsWith("✅")?"#ECFDF5":"#FEF2F2",borderRadius:10,padding:"10px 14px",fontSize:13,color:resetMsg.startsWith("✅")?"#059669":"#DC2626",marginBottom:14}}>{resetMsg}</div>}
          <FInput label="New Password"><input type="password" value={resetPw} onChange={e=>setResetPw(e.target.value)} style={iStyle} placeholder="Min 6 characters"/></FInput>
          <div style={{display:"flex",gap:10}}><Btn variant="secondary" onClick={()=>setModal(null)} style={{flex:1}}>Cancel</Btn><Btn onClick={resetPassword} style={{flex:2}}>Update Password</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ─── ORG CHART ─────────────────────────────────────────────────────────────────
function OrgNode({user,users,depth=0}){
  const [open,setOpen]=useState(true);
  const children=users.filter(u=>u.managerId===user.id);
  const rc=ROLE_COLORS[user.role]||{bg:BL,c:B};
  return (
    <div style={{marginLeft:depth*28}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",position:"relative"}}>
        {depth>0&&<div style={{position:"absolute",left:-20,top:0,bottom:"50%",borderLeft:"2px dashed #E8EAFF",borderBottom:"2px dashed #E8EAFF",width:18,borderRadius:"0 0 0 8px"}}/>}
        {children.length>0&&<button onClick={()=>setOpen(o=>!o)} style={{background:BL,border:"none",borderRadius:6,width:22,height:22,cursor:"pointer",fontSize:10,color:B,fontWeight:700,flexShrink:0}}>{open?"▼":"▶"}</button>}
        {children.length===0&&<div style={{width:22}}/>}
        <Avatar initials={user.avatar} size={32} color={rc.c}/>
        <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:"#111827"}}>{user.name}</div><div style={{fontSize:11,color:"#9CA3AF"}}>{user.dept}</div></div>
        <Badge label={user.role} type="role"/>
        <Badge label={user.status}/>
      </div>
      {open&&children.length>0&&<div style={{marginLeft:28,borderLeft:"2px dashed #E8EAFF"}}>{children.map(c=><OrgNode key={c.id} user={c} users={users} depth={1}/>)}</div>}
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ expenses, reports, users, rates }) {
  const totalUSD = expenses.reduce((s,e)=>s+toUSD(e.amount,e.currency,rates),0);
  const pendingUSD = expenses.filter(e=>e.status==="Pending").reduce((s,e)=>s+toUSD(e.amount,e.currency,rates),0);
  const currencies = [...new Set(expenses.map(e=>e.currency))];
  const months=["Sep","Oct","Nov","Dec","Jan","Feb"];
  const data=[2100,3400,1800,4200,2900,3089];
  const max=Math.max(...data);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
        {[
          {l:"Total Submitted",v:fmtUSD(totalUSD),s:`${currencies.length} currencies`,i:"💰"},
          {l:"Pending Approval",v:fmtUSD(pendingUSD),s:`${expenses.filter(e=>e.status==="Pending").length} expenses`,i:"⏳",a:"#FFF8E1"},
          {l:"Total Users",v:users.length,s:`${users.filter(u=>u.status==="Active").length} active`,i:"👥"},
          {l:"Open Reports",v:reports.filter(r=>!["Reimbursed","Approved"].includes(r.status)).length,s:"In pipeline",i:"📊"},
        ].map(s=>(
          <div key={s.l} style={{flex:1,minWidth:160,background:"#fff",borderRadius:16,border:"1px solid #E8EAFF",padding:"20px 22px",boxShadow:"0 2px 10px rgba(26,62,255,0.05)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:12,color:"#6B7280",fontWeight:500}}>{s.l}</span>
              <span style={{background:s.a||BL,borderRadius:8,padding:"5px 7px",fontSize:16}}>{s.i}</span>
            </div>
            <div style={{fontSize:22,fontWeight:800,color:"#111827",letterSpacing:"-0.03em"}}>{s.v}</div>
            <div style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>{s.s}</div>
          </div>
        ))}
      </div>

      {/* Currency breakdown */}
      <Card>
        <div style={{fontWeight:700,fontSize:14,color:"#111827",marginBottom:16}}>💱 Spend by Currency (USD equivalent)</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {currencies.map(cur=>{
            const curTotal = expenses.filter(e=>e.currency===cur).reduce((s,e)=>s+toUSD(e.amount,e.currency,rates),0);
            const pct = totalUSD>0?Math.round((curTotal/totalUSD)*100):0;
            const c = CURRENCIES[cur];
            return (
              <div key={cur} style={{flex:1,minWidth:140,background:"#F9FAFB",borderRadius:12,padding:"14px 16px",border:"1px solid #F3F4F6"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:18}}>{c?.flag||"🌐"}</span>
                  <span style={{fontSize:11,fontWeight:700,color:B}}>{pct}%</span>
                </div>
                <div style={{fontWeight:800,fontSize:15,color:"#111827"}}>{cur}</div>
                <div style={{fontSize:12,color:"#6B7280",marginTop:2,marginBottom:10}}>{c?.name||cur}</div>
                <div style={{height:5,background:"#E8EAFF",borderRadius:10}}><div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${B},#6B8AFF)`,borderRadius:10}}/></div>
                <div style={{fontSize:11,fontWeight:700,color:B,marginTop:6}}>{fmtUSD(curTotal)}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
        <Card style={{flex:2,minWidth:280}}>
          <div style={{fontWeight:700,fontSize:14,color:"#111827",marginBottom:20}}>Monthly Spend (USD)</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:10,height:120}}>
            {months.map((m,i)=>(
              <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <div style={{fontSize:10,fontWeight:700,color:"#6B7280"}}>${(data[i]/1000).toFixed(1)}k</div>
                <div style={{width:"100%",borderRadius:"6px 6px 0 0",height:`${(data[i]/max)*90}px`,background:i===months.length-1?`linear-gradient(180deg,${B},#6B8AFF)`:"#E8EAFF"}}/>
                <div style={{fontSize:11,color:"#9CA3AF"}}>{m}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{flex:1,minWidth:220}}>
          <div style={{fontWeight:700,fontSize:14,color:"#111827",marginBottom:16}}>Report Pipeline</div>
          {[["Manager Review",1,"#F59E0B"],["Finance Review",1,"#1565C0"],["Approved",1,"#059669"]].map(([s,n,c])=>(
            <div key={s} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #F3F4F6"}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}><div style={{width:8,height:8,borderRadius:"50%",background:c}}/><span style={{fontSize:13,color:"#374151"}}>{s}</span></div>
              <span style={{fontWeight:700,fontSize:14,color:"#111827"}}>{n}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── CURRENCY PAGE ─────────────────────────────────────────────────────────────
function CurrencyPage({ rates, loading, lastUpdated, error, onRefresh }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <CurrencyConverter rates={rates}/>
      <RateTable rates={rates} loading={loading} lastUpdated={lastUpdated} error={error} onRefresh={onRefresh}/>
    </div>
  );
}

// ─── NAV ───────────────────────────────────────────────────────────────────────
const NAV=[
  {id:"dashboard",label:"Dashboard",icon:"⬛"},
  {id:"expenses", label:"Expenses", icon:"💳"},
  {id:"reports",  label:"Reports",  icon:"📊"},
  {id:"currency", label:"Currency", icon:"💱"},
  {id:"users",    label:"Users",    icon:"👥"},
  {id:"hierarchy",label:"Org Chart",icon:"🌐"},
  {id:"analytics",label:"Analytics",icon:"📈"},
];

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [reports] = useState(INITIAL_REPORTS);
  const { rates, loading, lastUpdated, error, fetchRates } = useExchangeRates();

  if(!currentUser) return <LoginPage onLogin={u=>setCurrentUser(u)}/>;

  const visibleNav = NAV.filter(n=>{
    if(n.id==="users"&&!["Admin","Director"].includes(currentUser.role)) return false;
    return true;
  });
  const pageTitle = visibleNav.find(n=>n.id===activeNav)?.label||"Dashboard";

  return (
    <div style={{fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",background:"#F5F7FF",minHeight:"100vh",display:"flex",color:"#111827"}}>
      {/* Sidebar */}
      <div style={{width:sidebarOpen?220:60,background:`linear-gradient(180deg,${NAVY},#0D2080)`,minHeight:"100vh",display:"flex",flexDirection:"column",transition:"width 0.22s ease",overflow:"hidden",flexShrink:0,zIndex:10}}>
        <div style={{padding:sidebarOpen?"22px 18px 18px":"22px 12px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:8,justifyContent:sidebarOpen?"flex-start":"center"}}>
          <div style={{background:"#fff",borderRadius:10,padding:"4px 12px",fontWeight:900,fontSize:15,color:B,letterSpacing:"-0.03em",whiteSpace:"nowrap"}}>alera</div>
          {sidebarOpen&&<span style={{fontSize:10,color:"rgba(255,255,255,0.35)",fontWeight:500}}>Expense</span>}
        </div>
        <nav style={{flex:1,padding:"14px 10px",display:"flex",flexDirection:"column",gap:3}}>
          {visibleNav.map(item=>(
            <button key={item.id} onClick={()=>setActiveNav(item.id)} style={{display:"flex",alignItems:"center",gap:10,padding:sidebarOpen?"10px 13px":"10px 0",justifyContent:sidebarOpen?"flex-start":"center",borderRadius:11,border:"none",cursor:"pointer",width:"100%",background:activeNav===item.id?"rgba(255,255,255,0.12)":"transparent",color:activeNav===item.id?"#fff":"rgba(255,255,255,0.5)",fontWeight:activeNav===item.id?700:500,fontSize:13,borderLeft:activeNav===item.id?`3px solid ${B}`:"3px solid transparent",transition:"all 0.12s"}}>
              <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
              {sidebarOpen&&<span style={{whiteSpace:"nowrap"}}>{item.label}</span>}
            </button>
          ))}
        </nav>
        {/* Rate indicator in sidebar */}
        {sidebarOpen&&(
          <div style={{padding:"10px 14px",margin:"0 10px 10px",background:"rgba(255,255,255,0.06)",borderRadius:10}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:4}}>LIVE RATES {loading?"⟳":""}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontWeight:600}}>1 EUR = {(1/(rates["EUR"]||0.92)).toFixed(4)} USD</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>1 GBP = {(1/(rates["GBP"]||0.79)).toFixed(4)} USD</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>1 INR = {(1/(rates["INR"]||83.9)).toFixed(5)} USD</div>
          </div>
        )}
        <div style={{padding:"14px 10px",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:10,justifyContent:sidebarOpen?"flex-start":"center"}}>
          <Avatar initials={currentUser.avatar} size={32} color={ROLE_COLORS[currentUser.role]?.c||B}/>
          {sidebarOpen&&<div style={{overflow:"hidden"}}><div style={{color:"#fff",fontSize:12,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{currentUser.name}</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:10}}>{currentUser.role}</div></div>}
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <div style={{background:"#fff",borderBottom:"1px solid #E8EAFF",padding:"0 24px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:5}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setSidebarOpen(s=>!s)} style={{background:"none",border:"none",cursor:"pointer",color:"#6B7280",fontSize:18,padding:4}}>☰</button>
            <div style={{fontWeight:800,fontSize:17,color:"#111827"}}>{pageTitle}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {/* Live rate pill in topbar */}
            <div style={{background:BL,borderRadius:8,padding:"5px 12px",display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:11,color:B,fontWeight:700}}>💱 Live Rates</span>
              {loading?<span style={{fontSize:10,color:"#9CA3AF"}}>Updating…</span>:<span style={{fontSize:10,color:"#9CA3AF"}}>{lastUpdated||"Cached"}</span>}
            </div>
            <Badge label={currentUser.role} type="role"/>
            <div style={{position:"relative"}}>
              <button style={{background:"none",border:"none",cursor:"pointer",fontSize:18}}>🔔</button>
              <div style={{position:"absolute",top:2,right:2,width:7,height:7,background:"#EF4444",borderRadius:"50%",border:"2px solid #fff"}}/>
            </div>
            <button onClick={()=>setCurrentUser(null)} style={{background:"#FEF2F2",border:"none",borderRadius:9,padding:"7px 12px",fontSize:12,fontWeight:700,color:"#DC2626",cursor:"pointer"}}>Sign Out</button>
          </div>
        </div>

        <div style={{flex:1,padding:24,overflowY:"auto"}}>
          {activeNav==="dashboard"   && <Dashboard expenses={expenses} reports={reports} users={users} rates={rates}/>}
          {activeNav==="expenses"    && <ExpensesView expenses={expenses} setExpenses={setExpenses} users={users} currentUser={currentUser} rates={rates}/>}
          {activeNav==="reports"     && <ReportsView reports={reports} expenses={expenses} users={users} currentUser={currentUser} rates={rates}/>}
          {activeNav==="currency"    && <CurrencyPage rates={rates} loading={loading} lastUpdated={lastUpdated} error={error} onRefresh={fetchRates}/>}
          {activeNav==="users"       && <UserManagement users={users} setUsers={setUsers}/>}
          {activeNav==="hierarchy"   && (
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              <Card><div style={{fontWeight:700,fontSize:15,color:"#111827",marginBottom:6}}>Organization Hierarchy</div><div style={{fontSize:12,color:"#9CA3AF",marginBottom:22}}>Reporting structure & approval chain</div>{users.filter(u=>u.managerId===null).map(u=><OrgNode key={u.id} user={u} users={users} depth={0}/>)}</Card>
              <WorkflowDiagram/>
            </div>
          )}
          {activeNav==="analytics"   && (
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                {[{l:"YTD Spend",v:fmtUSD(expenses.reduce((s,e)=>s+toUSD(e.amount,e.currency,rates),0)),s:"All currencies → USD",i:"📊"},{l:"Avg Report",v:"$1,956",s:"9 reports",i:"📈"},{l:"Reimbursement",v:"2.4d",s:"Average time",i:"⚡"}].map(s=>(
                  <div key={s.l} style={{flex:1,minWidth:160,background:"#fff",borderRadius:14,border:"1px solid #E8EAFF",padding:"20px 22px"}}>
                    <div style={{fontSize:20,marginBottom:8}}>{s.i}</div>
                    <div style={{fontWeight:800,fontSize:22,color:"#111827"}}>{s.v}</div>
                    <div style={{fontSize:12,color:"#9CA3AF"}}>{s.l} · {s.s}</div>
                  </div>
                ))}
              </div>
              <Card>
                <div style={{fontWeight:700,fontSize:14,color:"#111827",marginBottom:18}}>Spend by Category (USD)</div>
                {Object.entries(
                  expenses.reduce((acc,e)=>{acc[e.category]=(acc[e.category]||0)+toUSD(e.amount,e.currency,rates);return acc;},{})
                ).sort((a,b)=>b[1]-a[1]).map(([c,amt])=>{
                  const total=expenses.reduce((s,e)=>s+toUSD(e.amount,e.currency,rates),0);
                  const pct=total>0?Math.round((amt/total)*100):0;
                  return (
                    <div key={c} style={{marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontSize:13,fontWeight:500}}>{CAT_ICONS[c]||"📋"} {c}</span>
                        <span style={{fontSize:13,color:"#6B7280"}}>{fmtUSD(amt)}</span>
                      </div>
                      <div style={{height:7,background:"#F3F4F6",borderRadius:10}}><div style={{width:`${pct}%`,height:"100%",borderRadius:10,background:`linear-gradient(90deg,${B},#6B8AFF)`}}/></div>
                    </div>
                  );
                })}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
