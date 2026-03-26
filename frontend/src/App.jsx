import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";

const STAGES = ["Created", "At Warehouse", "In Transit", "Delivered", "Completed"];
const STAGE_COLORS = ["#6366f1", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Vendor form
  const [vendorForm, setVendorForm] = useState({ name: "", location: "", walletAddress: "" });

  // Product form
  const [productForm, setProductForm] = useState({ name: "", description: "", vendorId: "" });

  // Stage update form
  const [stageForm, setStageForm] = useState({ productId: "", newStage: "0", location: "", notes: "" });

  // Payment form
  const [paymentForm, setPaymentForm] = useState({ productId: "", vendorId: "", vendorWallet: "", amountInEth: "" });

  // Selected product history
  const [history, setHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [v, p, pay] = await Promise.all([
        axios.get(`${API}/vendors`),
        axios.get(`${API}/products`),
        axios.get(`${API}/payments`)
      ]);
      setVendors(v.data);
      setProducts(p.data);
      setPayments(pay.data);
    } catch (e) {
      console.error(e);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const registerVendor = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/vendors/register`, vendorForm);
      showMessage("✅ Vendor registered on blockchain!");
      setVendorForm({ name: "", location: "", walletAddress: "" });
      fetchAll();
    } catch (e) {
      showMessage("❌ Error: " + e.response?.data?.error);
    }
    setLoading(false);
  };

  const createProduct = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/products/create`, productForm);
      showMessage("✅ Product added to blockchain!");
      setProductForm({ name: "", description: "", vendorId: "" });
      fetchAll();
    } catch (e) {
      showMessage("❌ Error: " + e.response?.data?.error);
    }
    setLoading(false);
  };

  const updateStage = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/products/update-stage`, stageForm);
      showMessage("✅ Product stage updated on blockchain!");
      fetchAll();
    } catch (e) {
      showMessage("❌ Error: " + e.response?.data?.error);
    }
    setLoading(false);
  };

  const createPayment = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/payments/create`, paymentForm);
      showMessage("✅ Payment locked in smart contract!");
      setPaymentForm({ productId: "", vendorId: "", vendorWallet: "", amountInEth: "" });
      fetchAll();
    } catch (e) {
      showMessage("❌ Error: " + e.response?.data?.error);
    }
    setLoading(false);
  };

  const releasePayment = async (id) => {
    setLoading(true);
    try {
      await axios.post(`${API}/payments/release/${id}`);
      showMessage("✅ Payment released to vendor!");
      fetchAll();
    } catch (e) {
      showMessage("❌ Error: " + e.response?.data?.error);
    }
    setLoading(false);
  };

  const viewHistory = async (product) => {
    setSelectedProduct(product);
    const res = await axios.get(`${API}/products/${product.id}/history`);
    setHistory(res.data);
    setTab("history");
  };

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ background: "#1e293b", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #334155" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", color: "#6366f1" }}>⛓️ BlockChain Supply Chain</h1>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Powered by Ethereum Smart Contracts</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["dashboard", "vendors", "products", "payments"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
              background: tab === t ? "#6366f1" : "#334155",
              color: tab === t ? "white" : "#94a3b8",
              textTransform: "capitalize", fontWeight: tab === t ? "bold" : "normal"
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{ background: message.startsWith("✅") ? "#064e3b" : "#7f1d1d", padding: "12px 32px", textAlign: "center", fontSize: "14px" }}>
          {message}
        </div>
      )}

      <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <div>
            <h2 style={{ color: "#6366f1" }}>📊 Dashboard</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
              {[
                { label: "Total Vendors", value: vendors.length, color: "#6366f1", icon: "🏭" },
                { label: "Total Products", value: products.length, color: "#10b981", icon: "📦" },
                { label: "Total Payments", value: payments.length, color: "#f59e0b", icon: "💰" }
              ].map(card => (
                <div key={card.label} style={{ background: "#1e293b", borderRadius: "12px", padding: "24px", borderLeft: `4px solid ${card.color}` }}>
                  <div style={{ fontSize: "32px" }}>{card.icon}</div>
                  <div style={{ fontSize: "36px", fontWeight: "bold", color: card.color }}>{card.value}</div>
                  <div style={{ color: "#94a3b8" }}>{card.label}</div>
                </div>
              ))}
            </div>

            <h3 style={{ color: "#94a3b8" }}>Recent Products</h3>
            <div style={{ background: "#1e293b", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#334155" }}>
                    {["ID", "Name", "Vendor", "Stage", "Action"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#94a3b8", fontSize: "13px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #334155" }}>
                      <td style={{ padding: "12px 16px" }}>#{p.id}</td>
                      <td style={{ padding: "12px 16px" }}>{p.name}</td>
                      <td style={{ padding: "12px 16px" }}>Vendor #{p.vendorId}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: STAGE_COLORS[p.stage], padding: "4px 10px", borderRadius: "20px", fontSize: "12px", color: "white" }}>
                          {STAGES[p.stage]}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => viewHistory(p)} style={{ background: "#6366f1", border: "none", color: "white", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && <tr><td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>No products yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VENDORS TAB */}
        {tab === "vendors" && (
          <div>
            <h2 style={{ color: "#6366f1" }}>🏭 Vendor Management</h2>
            <div style={{ background: "#1e293b", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
              <h3 style={{ marginTop: 0 }}>Register New Vendor</h3>
              <div style={{ display: "grid", gap: "12px" }}>
                {[
                  { key: "name", placeholder: "Vendor Name (e.g. Tata Motors)" },
                  { key: "location", placeholder: "Location (e.g. Mumbai, India)" },
                  { key: "walletAddress", placeholder: "Wallet Address (0x...)" }
                ].map(field => (
                  <input key={field.key} placeholder={field.placeholder} value={vendorForm[field.key]}
                    onChange={e => setVendorForm({ ...vendorForm, [field.key]: e.target.value })}
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "white", fontSize: "14px" }} />
                ))}
                <button onClick={registerVendor} disabled={loading} style={{ padding: "12px", background: "#6366f1", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>
                  {loading ? "Processing on Blockchain..." : "Register Vendor on Blockchain"}
                </button>
              </div>
            </div>

            <h3>All Vendors ({vendors.length})</h3>
            <div style={{ display: "grid", gap: "12px" }}>
              {vendors.map(v => (
                <div key={v.id} style={{ background: "#1e293b", borderRadius: "12px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>#{v.id} {v.name}</div>
                    <div style={{ color: "#94a3b8", fontSize: "13px" }}>📍 {v.location}</div>
                    <div style={{ color: "#64748b", fontSize: "11px", fontFamily: "monospace" }}>{v.walletAddress}</div>
                  </div>
                  <span style={{ background: v.isActive ? "#064e3b" : "#7f1d1d", color: v.isActive ? "#10b981" : "#ef4444", padding: "4px 12px", borderRadius: "20px", fontSize: "13px" }}>
                    {v.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
              {vendors.length === 0 && <div style={{ color: "#94a3b8", textAlign: "center", padding: "24px" }}>No vendors registered yet</div>}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <div>
            <h2 style={{ color: "#6366f1" }}>📦 Supply Chain Tracking</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
              <div style={{ background: "#1e293b", borderRadius: "12px", padding: "24px" }}>
                <h3 style={{ marginTop: 0 }}>Add New Product</h3>
                <div style={{ display: "grid", gap: "12px" }}>
                  {[
                    { key: "name", placeholder: "Product Name (e.g. iPhone 15)" },
                    { key: "description", placeholder: "Description" },
                    { key: "vendorId", placeholder: "Vendor ID (e.g. 1)" }
                  ].map(field => (
                    <input key={field.key} placeholder={field.placeholder} value={productForm[field.key]}
                      onChange={e => setProductForm({ ...productForm, [field.key]: e.target.value })}
                      style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "white", fontSize: "14px" }} />
                  ))}
                  <button onClick={createProduct} disabled={loading} style={{ padding: "12px", background: "#10b981", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: "bold" }}>
                    {loading ? "Processing..." : "Add to Blockchain"}
                  </button>
                </div>
              </div>

              <div style={{ background: "#1e293b", borderRadius: "12px", padding: "24px" }}>
                <h3 style={{ marginTop: 0 }}>Update Product Stage</h3>
                <div style={{ display: "grid", gap: "12px" }}>
                  <input placeholder="Product ID (e.g. 1)" value={stageForm.productId}
                    onChange={e => setStageForm({ ...stageForm, productId: e.target.value })}
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "white", fontSize: "14px" }} />
                  <select value={stageForm.newStage} onChange={e => setStageForm({ ...stageForm, newStage: e.target.value })}
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "white", fontSize: "14px" }}>
                    {STAGES.map((s, i) => <option key={i} value={i}>{s}</option>)}
                  </select>
                  <input placeholder="Current Location" value={stageForm.location}
                    onChange={e => setStageForm({ ...stageForm, location: e.target.value })}
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "white", fontSize: "14px" }} />
                  <input placeholder="Notes" value={stageForm.notes}
                    onChange={e => setStageForm({ ...stageForm, notes: e.target.value })}
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "white", fontSize: "14px" }} />
                  <button onClick={updateStage} disabled={loading} style={{ padding: "12px", background: "#f59e0b", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: "bold" }}>
                    {loading ? "Processing..." : "Update Stage on Blockchain"}
                  </button>
                </div>
              </div>
            </div>

            <h3>All Products ({products.length})</h3>
            <div style={{ display: "grid", gap: "12px" }}>
              {products.map(p => (
                <div key={p.id} style={{ background: "#1e293b", borderRadius: "12px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "bold" }}>#{p.id} {p.name}</div>
                    <div style={{ color: "#94a3b8", fontSize: "13px" }}>{p.description} • Vendor #{p.vendorId}</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ background: STAGE_COLORS[p.stage], padding: "4px 12px", borderRadius: "20px", fontSize: "12px", color: "white" }}>
                      {STAGES[p.stage]}
                    </span>
                    <button onClick={() => viewHistory(p)} style={{ background: "#334155", border: "none", color: "white", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>
                      History
                    </button>
                  </div>
                </div>
              ))}
              {products.length === 0 && <div style={{ color: "#94a3b8", textAlign: "center", padding: "24px" }}>No products yet</div>}
            </div>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {tab === "payments" && (
          <div>
            <h2 style={{ color: "#6366f1" }}>💰 Smart Contract Payments</h2>
            <div style={{ background: "#1e293b", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
              <h3 style={{ marginTop: 0 }}>Create Escrow Payment</h3>
              <div style={{ display: "grid", gap: "12px" }}>
                {[
                  { key: "productId", placeholder: "Product ID" },
                  { key: "vendorId", placeholder: "Vendor ID" },
                  { key: "vendorWallet", placeholder: "Vendor Wallet Address (0x...)" },
                  { key: "amountInEth", placeholder: "Amount in ETH (e.g. 0.5)" }
                ].map(field => (
                  <input key={field.key} placeholder={field.placeholder} value={paymentForm[field.key]}
                    onChange={e => setPaymentForm({ ...paymentForm, [field.key]: e.target.value })}
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "white", fontSize: "14px" }} />
                ))}
                <button onClick={createPayment} disabled={loading} style={{ padding: "12px", background: "#f59e0b", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: "bold" }}>
                  {loading ? "Processing..." : "Lock Payment in Smart Contract"}
                </button>
              </div>
            </div>

            <h3>All Payments ({payments.length})</h3>
            <div style={{ display: "grid", gap: "12px" }}>
              {payments.map(p => (
                <div key={p.id} style={{ background: "#1e293b", borderRadius: "12px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "bold" }}>Payment #{p.id} — {p.amount} ETH</div>
                    <div style={{ color: "#94a3b8", fontSize: "13px" }}>Product #{p.productId} • Vendor #{p.vendorId}</div>
                    <div style={{ color: "#64748b", fontSize: "11px", fontFamily: "monospace" }}>{p.vendor}</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{
                      background: p.status === "0" ? "#78350f" : p.status === "1" ? "#064e3b" : "#7f1d1d",
                      color: p.status === "0" ? "#fbbf24" : p.status === "1" ? "#10b981" : "#ef4444",
                      padding: "4px 12px", borderRadius: "20px", fontSize: "12px"
                    }}>
                      {p.status === "0" ? "Pending" : p.status === "1" ? "Released" : "Refunded"}
                    </span>
                    {p.status === "0" && (
                      <button onClick={() => releasePayment(p.id)} disabled={loading} style={{ background: "#10b981", border: "none", color: "white", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>
                        Release to Vendor
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {payments.length === 0 && <div style={{ color: "#94a3b8", textAlign: "center", padding: "24px" }}>No payments yet</div>}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && selectedProduct && (
          <div>
            <button onClick={() => setTab("products")} style={{ background: "#334155", border: "none", color: "white", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginBottom: "16px" }}>
              ← Back to Products
            </button>
            <h2 style={{ color: "#6366f1" }}>🗺️ Tracking History — {selectedProduct.name}</h2>
            <div style={{ display: "grid", gap: "0" }}>
              {history.map((event, i) => (
                <div key={i} style={{ display: "flex", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: STAGE_COLORS[event.stage], marginTop: "4px" }}></div>
                    {i < history.length - 1 && <div style={{ width: "2px", flex: 1, background: "#334155", margin: "4px 0" }}></div>}
                  </div>
                  <div style={{ background: "#1e293b", borderRadius: "12px", padding: "16px", marginBottom: "12px", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ background: STAGE_COLORS[event.stage], padding: "2px 10px", borderRadius: "20px", fontSize: "12px", color: "white" }}>
                        {STAGES[event.stage]}
                      </span>
                      <span style={{ color: "#64748b", fontSize: "12px" }}>
                        {new Date(Number(event.timestamp) * 1000).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ marginTop: "8px", fontWeight: "bold" }}>📍 {event.location}</div>
                    <div style={{ color: "#94a3b8", fontSize: "13px" }}>{event.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}