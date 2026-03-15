import { useState, useRef } from "react";

/* ─── Seed Data ─── */
const SEED_SPOTS = [
  {
    id: 1,
    name: "Front Yard – Spot A",
    address: "12, MG Road, Ghaziabad, UP 201001",
    lat: 28.6692,
    lng: 77.4538,
    type: "Open Air",
    priceHour: 30,
    priceDay: 200,
    status: "active",
    bookings: 14,
    rating: 4.7,
    photo: null,
    photoPreview: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&q=80",
    availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
    timeFrom: "08:00",
    timeTo: "20:00",
    description: "Spacious open yard with easy access from main road. Suitable for cars and bikes.",
    amenities: ["CCTV", "Lighting", "Wide Gate"],
  },
  {
    id: 2,
    name: "Side Lane – Spot B",
    address: "12, MG Road, Ghaziabad, UP 201001",
    lat: 28.6695,
    lng: 77.4542,
    type: "Covered",
    priceHour: 50,
    priceDay: 320,
    status: "active",
    bookings: 8,
    rating: 4.9,
    photo: null,
    photoPreview: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&q=80",
    availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true },
    timeFrom: "00:00",
    timeTo: "23:59",
    description: "Fully covered spot with shade. Perfect for long hours or overnight parking.",
    amenities: ["CCTV", "Covered Roof", "Security Guard", "EV Charging"],
  },
];

const DAYS = ["mon","tue","wed","thu","fri","sat","sun"];
const DAY_L = ["Mo","Tu","We","Th","Fr","Sa","Su"];

const BLANK = {
  name:"", address:"", lat:"", lng:"", type:"Open Air",
  priceHour:"", priceDay:"", status:"active",
  timeFrom:"08:00", timeTo:"20:00",
  availability:{ mon:true,tue:true,wed:true,thu:true,fri:true,sat:false,sun:false },
  description:"", amenities:[], photo:null, photoPreview:null,
};

const AMENITY_OPTS = ["CCTV","Lighting","Covered Roof","Security Guard","EV Charging","Wide Gate","24/7 Access","Wheelchair Access"];

/* ─── Haversine distance in km ─── */
function haversine(lat1,lng1,lat2,lng2){
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return (R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(2);
}

/* ══════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════ */
export default function MyParkingLand(){
  const [spots, setSpots] = useState(SEED_SPOTS);
  const [tab, setTab] = useState("spots"); // spots | add | detail | distance
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [activeSpot, setActiveSpot] = useState(null);
  const [saved, setSaved] = useState(false);

  /* distance tool */
  const [destLat, setDestLat] = useState("");
  const [destLng, setDestLng] = useState("");
  const [destName, setDestName] = useState("");

  const fileRef = useRef();

  function openAdd(){
    setForm(BLANK); setEditId(null); setTab("add");
  }
  function openEdit(spot){
    setForm({...spot}); setEditId(spot.id); setTab("add");
  }
  function openDetail(spot){
    setActiveSpot(spot); setTab("detail");
  }

  function handlePhoto(e){
    const file = e.target.files[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    setForm(f=>({...f, photo:file, photoPreview:url}));
  }

  function toggleAmenity(a){
    setForm(f=>({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x=>x!==a) : [...f.amenities,a]
    }));
  }

  function saveSpot(){
    if(!form.name||!form.address||!form.priceHour) return;
    const spot = {
      ...form, priceHour:Number(form.priceHour), priceDay:Number(form.priceDay),
      lat:Number(form.lat)||28.6692, lng:Number(form.lng)||77.4538,
      bookings: editId ? spots.find(s=>s.id===editId).bookings : 0,
      rating: editId ? spots.find(s=>s.id===editId).rating : 5.0,
      id: editId || Date.now(),
    };
    setSpots(editId ? spots.map(s=>s.id===editId?spot:s) : [...spots,spot]);
    setSaved(true);
    setTimeout(()=>{ setSaved(false); setTab("spots"); }, 1400);
  }

  function removeSpot(id){
    setSpots(spots.filter(s=>s.id!==id));
    if(tab==="detail") setTab("spots");
  }

  function toggleStatus(id){
    setSpots(spots.map(s=>s.id===id?{...s,status:s.status==="active"?"inactive":"active"}:s));
  }

  const totalBookings = spots.reduce((a,s)=>a+s.bookings,0);
  const estEarnings = spots.reduce((a,s)=>a+s.bookings*s.priceHour*2,0);

  return(
    <div className="min-h-screen bg-[#0c0e13] text-[#e2e2e2] font-['DM Sans',sans-serif]"
         style={{
           backgroundImage: "radial-gradient(ellipse at 20% 0%, #1a1f35 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, #1a2515 0%, transparent 60%)"
         }}>

      {/* ── NAV ── */}
      <nav className="bg-[#0d0f14]/92 backdrop-blur-md border-b border-[#1e2130] px-8 flex items-center justify-between h-16 sticky top-0 z-100">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] bg-gradient-to-r from-[#c8f53a] to-[#6fcf30] rounded-[11px] flex items-center justify-center text-xl shadow-[0_0_16px_#6fcf3055]">
            🅿
          </div>
          <span className="font-['Syne',sans-serif] font-extrabold text-lg tracking-tight">ParkEase</span>
          <span className="bg-[#1c2b12] text-[#c8f53a] text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide">OWNER PORTAL</span>
        </div>
        <div className="flex items-center gap-2">
          {[
            {key:"spots",icon:"⊟",label:"My Spots"},
            {key:"distance",icon:"⊕",label:"Distance Tool"},
          ].map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              className={`px-4 py-2 rounded-[10px] border-none cursor-pointer font-['DM Sans',sans-serif] font-semibold text-sm transition-all
                ${tab===t.key ? 'bg-[#c8f53a] text-[#0c0e13]' : 'bg-transparent text-gray-500'}`}>
              {t.icon} {t.label}
            </button>
          ))}
          <div className="w-px h-7 bg-[#1e2130] mx-2"/>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#c8f53a] to-[#6fcf30] flex items-center justify-center font-['Syne',sans-serif] font-extrabold text-xs text-[#0c0e13]">
              RK
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Rajesh Kumar</div>
              <div className="text-xs text-gray-600">Land Owner · Ghaziabad</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-6 py-9">

        {/* ══ SPOTS TAB ══ */}
        {tab==="spots"&&(
          <>
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="font-['Syne',sans-serif] text-4xl font-extrabold m-0 tracking-tight bg-gradient-to-r from-[#e2e2e2] to-gray-500 bg-clip-text text-transparent">
                  My Parking Land
                </h1>
                <p className="text-gray-600 mt-1.5 text-sm">
                  {spots.length} spot{spots.length!==1?"s":""} listed · {spots.filter(s=>s.status==="active").length} active
                </p>
              </div>
              {spots.length<3&&(
                <button onClick={openAdd}
                  className="bg-gradient-to-r from-[#c8f53a] to-[#6fcf30] text-[#0c0e13] border-none rounded-xl px-6 py-3.5 font-bold text-sm cursor-pointer font-['Syne',sans-serif] tracking-tight shadow-[0_4px_20px_#6fcf3040]">
                  + Add Parking Spot
                </button>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 mb-9">
              {[
                {label:"Total Spots",value:spots.length,unit:"",icon:"🗺",color:"text-blue-400"},
                {label:"Active Now",value:spots.filter(s=>s.status==="active").length,unit:"",icon:"🟢",color:"text-[#c8f53a]"},
                {label:"All Bookings",value:totalBookings,unit:"",icon:"📅",color:"text-yellow-400"},
                {label:"Est. Earnings",value:`₹${estEarnings.toLocaleString()}`,unit:"",icon:"💰",color:"text-orange-400"},
              ].map(st=>(
                <div key={st.label} className="bg-[#13151c] border border-[#222530] rounded-xl p-5.5">
                  <div className="text-2xl mb-2.5">{st.icon}</div>
                  <div className={`font-['Syne',sans-serif] text-2xl font-extrabold ${st.color}`}>{st.value}</div>
                  <div className="text-xs text-gray-600 mt-1">{st.label}</div>
                </div>
              ))}
            </div>

            {/* Spot cards */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
              {spots.map(spot=>(
                <SpotCard key={spot.id} spot={spot}
                  onView={()=>openDetail(spot)}
                  onEdit={()=>openEdit(spot)}
                  onToggle={()=>toggleStatus(spot.id)}
                  onRemove={()=>removeSpot(spot.id)}/>
              ))}
              {spots.length<3&&(
                <div onClick={openAdd}
                  className="border-2 border-dashed border-[#222530] rounded-xl min-h-[260px] flex flex-col items-center justify-center cursor-pointer text-gray-700 hover:border-[#c8f53a] hover:text-[#c8f53a] transition-all gap-2"
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#c8f53a";e.currentTarget.style.color="#c8f53a"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#222530";e.currentTarget.style.color="#333"}}>
                  <div className="text-4xl">＋</div>
                  <div className="font-['Syne',sans-serif] font-bold text-sm">Add New Spot</div>
                  <div className="text-xs">{3-spots.length} slot{3-spots.length!==1?"s":""} available</div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ ADD / EDIT TAB ══ */}
        {tab==="add"&&(
          <div className="max-w-[680px] mx-auto">
            <button onClick={()=>setTab("spots")}
              className="bg-transparent border-none text-gray-500 cursor-pointer text-xs mb-6 flex items-center gap-1.5 p-0 hover:text-[#c8f53a] transition-colors">
              ← Back to spots
            </button>
            <h2 className="font-['Syne',sans-serif] text-2xl font-extrabold m-0 mb-1 tracking-tight">
              {editId?"Edit Spot":"Register New Spot"}
            </h2>
            <p className="text-gray-600 text-xs m-0 mb-8">
              Fill in the details about your parking land
            </p>

            <div className="grid gap-5.5">
              {/* Photo upload */}
              <div>
                <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Photo of Spot</label>
                <div onClick={()=>fileRef.current.click()}
                  className="rounded-xl border-2 border-dashed border-[#252830] overflow-hidden cursor-pointer h-[180px] flex items-center justify-center bg-[#111318] relative hover:border-[#c8f53a] transition-colors">
                  {form.photoPreview
                    ? <img src={form.photoPreview} alt="" className="w-full h-full object-cover"/>
                    : <div className="text-center text-gray-600">
                        <div className="text-3xl mb-2">📷</div>
                        <div className="text-xs font-semibold">Click to upload photo</div>
                        <div className="text-[11px] mt-1">JPG, PNG up to 10MB</div>
                      </div>
                  }
                  {form.photoPreview&&(
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white font-semibold text-xs">Change Photo</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto}/>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Spot Name</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                  placeholder="e.g. Front Yard – Spot A" 
                  className="w-full bg-[#111318] border border-[#252830] rounded-[10px] px-3.5 py-2.5 text-[#e2e2e2] text-sm font-['DM Sans',sans-serif] outline-none focus:border-[#c8f53a] focus:shadow-[0_0_0_3px_rgba(200,245,58,0.1)] transition-all"/>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Full Address</label>
                <input value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}
                  placeholder="Street, City, PIN" 
                  className="w-full bg-[#111318] border border-[#252830] rounded-[10px] px-3.5 py-2.5 text-[#e2e2e2] text-sm font-['DM Sans',sans-serif] outline-none focus:border-[#c8f53a] focus:shadow-[0_0_0_3px_rgba(200,245,58,0.1)] transition-all"/>
              </div>

              {/* Lat/Lng */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Latitude</label>
                  <input value={form.lat} onChange={e=>setForm(f=>({...f,lat:e.target.value}))}
                    placeholder="e.g. 28.6692" type="number" step="any"
                    className="w-full bg-[#111318] border border-[#252830] rounded-[10px] px-3.5 py-2.5 text-[#e2e2e2] text-sm font-['DM Sans',sans-serif] outline-none focus:border-[#c8f53a] focus:shadow-[0_0_0_3px_rgba(200,245,58,0.1)] transition-all"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Longitude</label>
                  <input value={form.lng} onChange={e=>setForm(f=>({...f,lng:e.target.value}))}
                    placeholder="e.g. 77.4538" type="number" step="any"
                    className="w-full bg-[#111318] border border-[#252830] rounded-[10px] px-3.5 py-2.5 text-[#e2e2e2] text-sm font-['DM Sans',sans-serif] outline-none focus:border-[#c8f53a] focus:shadow-[0_0_0_3px_rgba(200,245,58,0.1)] transition-all"/>
                </div>
              </div>
              <div className="text-xs text-gray-600 -mt-3.5 p-2.5 bg-[#111318] rounded-lg border border-[#1e2130]">
                💡 Open Google Maps → right-click your land → copy the coordinates shown
              </div>

              {/* Type + Price */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Spot Type</label>
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} 
                    className="w-full bg-[#111318] border border-[#252830] rounded-[10px] px-3.5 py-2.5 text-[#e2e2e2] text-sm font-['DM Sans',sans-serif] outline-none focus:border-[#c8f53a] focus:shadow-[0_0_0_3px_rgba(200,245,58,0.1)] transition-all">
                    {["Open Air","Covered","Underground","Basement"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Price / Hour (₹)</label>
                  <input value={form.priceHour} onChange={e=>setForm(f=>({...f,priceHour:e.target.value}))}
                    placeholder="₹ 30" type="number"
                    className="w-full bg-[#111318] border border-[#252830] rounded-[10px] px-3.5 py-2.5 text-[#e2e2e2] text-sm font-['DM Sans',sans-serif] outline-none focus:border-[#c8f53a] focus:shadow-[0_0_0_3px_rgba(200,245,58,0.1)] transition-all"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Price / Day (₹)</label>
                  <input value={form.priceDay} onChange={e=>setForm(f=>({...f,priceDay:e.target.value}))}
                    placeholder="₹ 200" type="number"
                    className="w-full bg-[#111318] border border-[#252830] rounded-[10px] px-3.5 py-2.5 text-[#e2e2e2] text-sm font-['DM Sans',sans-serif] outline-none focus:border-[#c8f53a] focus:shadow-[0_0_0_3px_rgba(200,245,58,0.1)] transition-all"/>
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Open From</label>
                  <input value={form.timeFrom} onChange={e=>setForm(f=>({...f,timeFrom:e.target.value}))}
                    type="time"
                    className="w-full bg-[#111318] border border-[#252830] rounded-[10px] px-3.5 py-2.5 text-[#e2e2e2] text-sm font-['DM Sans',sans-serif] outline-none focus:border-[#c8f53a] focus:shadow-[0_0_0_3px_rgba(200,245,58,0.1)] transition-all"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Close At</label>
                  <input value={form.timeTo} onChange={e=>setForm(f=>({...f,timeTo:e.target.value}))}
                    type="time"
                    className="w-full bg-[#111318] border border-[#252830] rounded-[10px] px-3.5 py-2.5 text-[#e2e2e2] text-sm font-['DM Sans',sans-serif] outline-none focus:border-[#c8f53a] focus:shadow-[0_0_0_3px_rgba(200,245,58,0.1)] transition-all"/>
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Available Days</label>
                <div className="flex gap-2">
                  {DAYS.map((d,i)=>(
                    <button key={d} type="button"
                      onClick={()=>setForm(f=>({...f,availability:{...f.availability,[d]:!f.availability[d]}}))}
                      className={`w-11 h-11 rounded-[10px] border font-bold text-xs cursor-pointer font-['DM Sans',sans-serif] transition-all
                        ${form.availability[d] ? 'bg-[#1c2b12] border-[#c8f53a] text-[#c8f53a]' : 'bg-transparent border-[#252830] text-gray-600'}`}>
                      {DAY_L[i]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTS.map(a=>(
                    <button key={a} type="button" onClick={()=>toggleAmenity(a)}
                      className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all
                        ${form.amenities.includes(a) ? 'bg-[#12182e] border-[#6c8ef7] text-[#6c8ef7]' : 'bg-transparent border-[#252830] text-gray-600'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Description</label>
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                  placeholder="Describe your parking spot — access, surface, neighborhood..." rows={3}
                  className="w-full bg-[#111318] border border-[#252830] rounded-[10px] px-3.5 py-2.5 text-[#e2e2e2] text-sm font-['DM Sans',sans-serif] outline-none resize-y leading-relaxed focus:border-[#c8f53a] focus:shadow-[0_0_0_3px_rgba(200,245,58,0.1)] transition-all"/>
              </div>

              {/* Save */}
              <div className="flex gap-3 pt-2">
                <button onClick={saveSpot}
                  className={`flex-1 py-3.5 rounded-xl border-none cursor-pointer font-['Syne',sans-serif] font-extrabold text-sm transition-all
                    ${saved ? 'bg-[#1c2b12] text-[#c8f53a]' : 'bg-gradient-to-r from-[#c8f53a] to-[#6fcf30] text-[#0c0e13] shadow-[0_6px_24px_#6fcf3040]'}`}>
                  {saved?"✓ Spot Saved!": editId?"Update Spot":"List My Spot"}
                </button>
                <button onClick={()=>setTab("spots")}
                  className="px-5 py-3.5 rounded-xl border border-[#252830] bg-transparent text-gray-500 cursor-pointer font-semibold text-sm hover:border-[#c8f53a] hover:text-[#c8f53a] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ DETAIL TAB ══ */}
        {tab==="detail"&&activeSpot&&(()=>{
          const spot = spots.find(s=>s.id===activeSpot.id)||activeSpot;
          return(
            <div>
              <button onClick={()=>setTab("spots")}
                className="bg-transparent border-none text-gray-500 cursor-pointer text-xs mb-6 flex items-center gap-1.5 p-0 hover:text-[#c8f53a] transition-colors">
                ← Back to spots
              </button>
              <div className="grid grid-cols-2 gap-7">
                {/* Left */}
                <div>
                  <div className="rounded-lg overflow-hidden h-[260px] bg-[#111318] mb-5">
                    {spot.photoPreview
                      ?<img src={spot.photoPreview} alt="" className="w-full h-full object-cover"/>
                      :<div className="h-full flex items-center justify-center text-gray-700 text-5xl">🅿</div>
                    }
                  </div>
                  <div className="bg-[#13151c] border border-[#222530] rounded-xl p-6">
                    <h2 className="font-['Syne',sans-serif] text-2xl font-extrabold m-0 mb-1.5 tracking-tight">{spot.name}</h2>
                    <div className="text-xs text-gray-500 mb-4">📍 {spot.address}</div>
                    <p className="text-sm text-gray-400 leading-relaxed m-0 mb-5">{spot.description||"No description added."}</p>
                    <div className="flex flex-wrap gap-2">
                      {(spot.amenities||[]).map(a=>(
                        <span key={a} className="bg-[#12182e] text-[#6c8ef7] px-3 py-1.5 rounded-full text-xs font-semibold">✓ {a}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Right */}
                <div className="flex flex-col gap-4.5">
                  {/* Pricing */}
                  <div className="bg-[#13151c] border border-[#222530] rounded-xl p-6">
                    <div className="text-xs font-semibold text-gray-600 tracking-wide uppercase mb-3.5">Pricing</div>
                    <div className="flex gap-6">
                      <div>
                        <div className="font-['Syne',sans-serif] text-3xl font-extrabold text-[#c8f53a]">₹{spot.priceHour}</div>
                        <div className="text-xs text-gray-600">per hour</div>
                      </div>
                      <div className="w-px bg-[#1e2130]"/>
                      <div>
                        <div className="font-['Syne',sans-serif] text-3xl font-extrabold text-yellow-400">₹{spot.priceDay||"—"}</div>
                        <div className="text-xs text-gray-600">per day</div>
                      </div>
                    </div>
                  </div>
                  {/* Availability */}
                  <div className="bg-[#13151c] border border-[#222530] rounded-xl p-6">
                    <div className="text-xs font-semibold text-gray-600 tracking-wide uppercase mb-3.5">Availability</div>
                    <div className="flex gap-1.5 mb-3.5">
                      {DAYS.map((d,i)=>(
                        <div key={d} className={`flex-1 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold border
                          ${spot.availability[d] ? 'bg-[#1c2b12] border-[#c8f53a] text-[#c8f53a]' : 'bg-[#111318] border-[#1e2130] text-gray-700'}`}>
                          {DAY_L[i]}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">⏰ {spot.timeFrom} – {spot.timeTo}</div>
                  </div>
                  {/* Stats */}
                  <div className="bg-[#13151c] border border-[#222530] rounded-xl p-6">
                    <div className="text-xs font-semibold text-gray-600 tracking-wide uppercase mb-3.5">Performance</div>
                    <div className="flex gap-5">
                      <div><div className="font-['Syne',sans-serif] text-2xl font-extrabold text-blue-400">{spot.bookings}</div><div className="text-xs text-gray-600">Bookings</div></div>
                      <div><div className="font-['Syne',sans-serif] text-2xl font-extrabold text-orange-400">⭐ {spot.rating}</div><div className="text-xs text-gray-600">Rating</div></div>
                      <div><div className="font-['Syne',sans-serif] text-2xl font-extrabold text-[#c8f53a]">₹{spot.bookings*spot.priceHour*2}</div><div className="text-xs text-gray-600">Earned</div></div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2.5">
                    <button onClick={()=>openEdit(spot)}
                      className="flex-1 py-3.5 rounded-xl border-none bg-gradient-to-r from-[#c8f53a] to-[#6fcf30] text-[#0c0e13] font-bold text-xs cursor-pointer font-['Syne',sans-serif]">
                      ✏️ Edit Spot
                    </button>
                    <button onClick={()=>toggleStatus(spot.id)}
                      className={`flex-1 py-3.5 rounded-xl border text-xs font-bold cursor-pointer
                        ${spot.status==="active" ? 'border-[#252830] bg-transparent text-red-400' : 'border-[#252830] bg-transparent text-[#c8f53a]'}`}>
                      {spot.status==="active"?"⏸ Deactivate":"▶ Activate"}
                    </button>
                    <button onClick={()=>removeSpot(spot.id)}
                      className="px-4 py-3.5 rounded-xl border border-[#3a1818] bg-transparent text-red-400 text-xs cursor-pointer">
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ══ DISTANCE TOOL TAB ══ */}
        {tab==="distance"&&(
          <div>
            <h2 className="font-['Syne',sans-serif] text-2xl font-extrabold m-0 mb-1.5 tracking-tight">Distance Calculator</h2>
            <p className="text-gray-600 text-xs m-0 mb-8">Find how far each of your spots is from any destination</p>

            <div className="bg-[#13151c] border border-[#222530] rounded-xl p-7 mb-7 max-w-[560px]">
              <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Destination Name (optional)</label>
              <input value={destName} onChange={e=>setDestName(e.target.value)}
                placeholder="e.g. Indirapuram Mall" 
                className="w-full bg-[#111318] border border-[#252830] rounded-[10px] px-3.5 py-2.5 text-[#e2e2e2] text-sm font-['DM Sans',sans-serif] outline-none mb-4 focus:border-[#c8f53a] focus:shadow-[0_0_0_3px_rgba(200,245,58,0.1)] transition-all"/>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Destination Latitude</label>
                  <input value={destLat} onChange={e=>setDestLat(e.target.value)}
                    placeholder="e.g. 28.6450" type="number" step="any"
                    className="w-full bg-[#111318] border border-[#252830] rounded-[10px] px-3.5 py-2.5 text-[#e2e2e2] text-sm font-['DM Sans',sans-serif] outline-none focus:border-[#c8f53a] focus:shadow-[0_0_0_3px_rgba(200,245,58,0.1)] transition-all"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 tracking-wide uppercase block mb-1.5">Destination Longitude</label>
                  <input value={destLng} onChange={e=>setDestLng(e.target.value)}
                    placeholder="e.g. 77.3701" type="number" step="any"
                    className="w-full bg-[#111318] border border-[#252830] rounded-[10px] px-3.5 py-2.5 text-[#e2e2e2] text-sm font-['DM Sans',sans-serif] outline-none focus:border-[#c8f53a] focus:shadow-[0_0_0_3px_rgba(200,245,58,0.1)] transition-all"/>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-3 p-2.5 bg-[#111318] rounded-lg border border-[#1e2130]">
                💡 Go to Google Maps → search your destination → right-click → copy coordinates
              </div>
            </div>

            {destLat&&destLng&&(
              <div>
                <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-4">
                  Distance from "{destName||"Destination"}"
                </div>
                <div className="grid gap-3.5">
                  {spots.map((spot,i)=>{
                    const dist = haversine(spot.lat,spot.lng,Number(destLat),Number(destLng));
                    const walkMins = Math.round(dist/0.08);
                    const driveMins = Math.round(dist/0.5);
                    return(
                      <div key={spot.id} className="bg-[#13151c] border border-[#222530] rounded-xl p-6 flex items-center gap-6">
                        <div className="w-13 h-13 rounded-xl overflow-hidden flex-shrink-0 bg-[#111318]">
                          {spot.photoPreview
                            ?<img src={spot.photoPreview} alt="" className="w-full h-full object-cover"/>
                            :<div className="w-full h-full flex items-center justify-center text-2xl">🅿</div>
                          }
                        </div>
                        <div className="flex-1">
                          <div className="font-['Syne',sans-serif] font-bold text-base">{spot.name}</div>
                          <div className="text-xs text-gray-600">{spot.address}</div>
                        </div>
                        <div className="text-center p-2.5 pr-5 bg-[#0c0e13] rounded-xl border border-[#1e2130]">
                          <div className={`font-['Syne',sans-serif] text-2xl font-extrabold
                            ${dist<2 ? 'text-[#c8f53a]' : dist<5 ? 'text-yellow-400' : 'text-orange-400'}`}>{dist} km</div>
                          <div className="text-[11px] text-gray-600 mt-0.5">straight line</div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="bg-[#111318] rounded-[10px] px-3.5 py-2 text-xs text-gray-400 flex gap-2 items-center">
                            <span>🚶</span> ~{walkMins} min walk
                          </div>
                          <div className="bg-[#111318] rounded-[10px] px-3.5 py-2 text-xs text-gray-400 flex gap-2 items-center">
                            <span>🚗</span> ~{driveMins} min drive
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 p-4 pl-5 bg-[#111318] rounded-xl border border-[#1e2130] text-xs text-gray-500 leading-relaxed">
                  ℹ️ Distances are calculated as straight-line (as the crow flies). Actual road distances may vary.
                  Sort by distance to suggest the closest spot to your customers.
                </div>
              </div>
            )}
            {(!destLat||!destLng)&&(
              <div className="text-center py-16 text-gray-700">
                <div className="text-5xl mb-3">📍</div>
                <div className="font-['Syne',sans-serif] text-base font-bold text-gray-600">Enter a destination above</div>
                <div className="text-xs mt-1.5">Paste the lat/lng of any location to see distances from your spots</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── Spot Card ─── */
function SpotCard({spot,onView,onEdit,onToggle,onRemove}){
  const [hov,setHov]=useState(false);
  return(
    <div className={`bg-[#13151c] border border-[#222530] rounded-xl overflow-hidden cursor-pointer transition-all duration-200
      ${hov ? '-translate-y-1 shadow-[0_12px_40px_rgba(0,0,0,0.5)]' : 'shadow-[0_2px_12px_rgba(0,0,0,0.2)]'}`}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {/* Photo */}
      <div className="h-40 bg-[#111318] relative" onClick={onView}>
        {spot.photoPreview
          ?<img src={spot.photoPreview} alt="" className="w-full h-full object-cover"/>
          :<div className="h-full flex items-center justify-center text-5xl text-gray-800">🅿</div>
        }
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md rounded-lg px-2.5 py-1 text-[11px] font-bold text-[#c8f53a]">
          {spot.type}
        </div>
        <div className={`absolute top-3 right-3 w-2 h-2 rounded-full
          ${spot.status==="active" ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-gray-500'}`}/>
      </div>
      {/* Body */}
      <div className="p-5 pt-4 pb-4" onClick={onView}>
        <div className="font-['Syne',sans-serif] text-base font-bold mb-1 tracking-tight">{spot.name}</div>
        <div className="text-xs text-gray-600 mb-3.5">📍 {spot.address}</div>
        <div className="flex gap-4.5 mb-3.5">
          <div>
            <div className="font-['Syne',sans-serif] text-xl font-extrabold text-[#c8f53a]">₹{spot.priceHour}<span className="text-[11px] text-gray-600 font-normal">/hr</span></div>
          </div>
          <div>
            <div className="font-['Syne',sans-serif] text-xl font-extrabold text-blue-400">{spot.bookings}<span className="text-[11px] text-gray-600 font-normal ml-1">bookings</span></div>
          </div>
          <div>
            <div className="font-['Syne',sans-serif] text-xl font-extrabold text-yellow-400">⭐ {spot.rating}</div>
          </div>
        </div>
        <div className="flex gap-1 mb-1">
          {DAYS.map((d,i)=>(
            <div key={d} className={`flex-1 h-5.5 rounded flex items-center justify-center text-[8px] font-bold border
              ${spot.availability[d] ? 'bg-[#1c2b12] border-[#c8f53a]/30 text-[#c8f53a]' : 'bg-[#111318] border-[#1e2130] text-gray-700'}`}>
              {DAY_L[i]}
            </div>
          ))}
        </div>
        <div className="text-[11px] text-gray-600 mt-1.5">⏰ {spot.timeFrom} – {spot.timeTo}</div>
      </div>
      {/* Actions */}
      <div className="flex gap-2 p-4 pt-0">
        <button onClick={e=>{e.stopPropagation();onEdit();}}
          className="flex-1 py-2 rounded-lg border border-[#252830] bg-transparent text-gray-400 text-xs font-semibold cursor-pointer hover:border-[#c8f53a] hover:text-[#c8f53a] transition-colors">
          ✏️ Edit
        </button>
        <button onClick={e=>{e.stopPropagation();onToggle();}}
          className={`flex-1 py-2 rounded-lg border text-xs font-semibold cursor-pointer
            ${spot.status==="active" ? 'border-[#252830] bg-transparent text-red-400' : 'border-[#252830] bg-transparent text-[#c8f53a]'}`}>
          {spot.status==="active"?"⏸ Pause":"▶ Activate"}
        </button>
        <button onClick={e=>{e.stopPropagation();onRemove();}}
          className="px-3 py-2 rounded-lg border border-[#3a1818] bg-transparent text-red-400 text-xs cursor-pointer hover:bg-[#3a1818]/20 transition-colors">
          🗑
        </button>
      </div>
    </div>
  );
}