import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Package, 
  FileText, 
  CreditCard, 
  Code, 
  Eye, 
  Copy, 
  Plus, 
  Trash2, 
  ChevronRight,
  ChevronDown,
  Save,
  Check,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Search,
  Loader2
} from 'lucide-react';
import { FormState, PaymentMethod, FormField } from '../types';
import { DEFAULT_STATE, AVAILABLE_PAYMENTS, AVAILABLE_FIELDS } from '../constants';
import { generateHTML } from '../lib/generator';

export default function Editor() {
  const [state, setState] = useState<FormState>(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState<'config' | 'products' | 'fields' | 'payments' | 'preview' | 'code'>('config');
  const [copied, setCopied] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);
  const [storeSearchTerm, setStoreSearchTerm] = useState('');
  const [searchingStore, setSearchingStore] = useState(false);
  const [storeSearchResults, setStoreSearchResults] = useState<any[]>([]);
  const [storeNotFound, setStoreNotFound] = useState(false);

  useEffect(() => {
    setGeneratedHTML(generateHTML(state));
  }, [state]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab, state.config.apiKey, state.config.storeIntId]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`https://api.scalev.id/v2/stores/${state.config.storeIntId}/products`, {
        headers: {
          "Authorization": "Bearer " + state.config.apiKey,
          "Accept": "application/json",
        }
      });
      const data = await res.json();
      const results = data?.data?.results || data?.data || [];
      setProducts(results);
    } catch (e) {
      console.error("Failed to fetch products", e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const toggleVariantSelection = (id: string) => {
    setState(prev => {
      const current = prev.specificVariantIds;
      const next = current.includes(id) 
        ? current.filter(i => i !== id)
        : [...current, id];
      return { ...prev, specificVariantIds: next };
    });
  };

  const toggleAllVariants = (product: any) => {
    const variantIds = (product.variants || product.product_variants || []).map((v: any) => String(v.unique_id || v.id));
    setState(prev => {
      const current = prev.specificVariantIds;
      const allSelected = variantIds.every(id => current.includes(id));
      
      let next;
      if (allSelected) {
        next = current.filter(id => !variantIds.includes(id));
      } else {
        next = Array.from(new Set([...current, ...variantIds]));
      }
      return { ...prev, specificVariantIds: next };
    });
  };

  const toggleExpandProduct = (id: string) => {
    setExpandedProducts(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const searchStore = async () => {
    if (!state.config.apiKey || !storeSearchTerm) return;
    
    setSearchingStore(true);
    setStoreNotFound(false);
    try {
      const response = await fetch(`https://api.scalev.id/v2/stores/simplified?search=${encodeURIComponent(storeSearchTerm)}`, {
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${state.config.apiKey}`
        }
      });
      const data = await response.json();
      const results = data?.data?.results || data?.data || [];
      setStoreSearchResults(results);
      if (results.length === 0) {
        setStoreNotFound(true);
      }
    } catch (error) {
      console.error('Error searching store:', error);
      setStoreNotFound(true);
    } finally {
      setSearchingStore(false);
    }
  };

  const selectStore = (store: any) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        storeId: store.unique_id,
        storeIntId: store.id,
        storeName: store.name
      }
    }));
    setStoreSearchResults([]);
    setStoreSearchTerm('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateConfig = (key: keyof typeof state.config, value: string | number) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const togglePayment = (payment: PaymentMethod) => {
    const exists = state.payments.find(p => p.label === payment.label && p.sub === payment.sub);
    if (exists) {
      setState(prev => ({ ...prev, payments: prev.payments.filter(p => !(p.label === payment.label && p.sub === payment.sub)) }));
    } else {
      setState(prev => ({ ...prev, payments: [...prev.payments, payment] }));
    }
  };

  const movePayment = (index: number, direction: 'up' | 'down') => {
    const newPayments = [...state.payments];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPayments.length) return;
    
    [newPayments[index], newPayments[targetIndex]] = [newPayments[targetIndex], newPayments[index]];
    setState(prev => ({ ...prev, payments: newPayments }));
  };

  const toggleField = (field: FormField) => {
    const exists = state.fields.find(f => f.id === field.id);
    if (exists) {
      setState(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== field.id) }));
    } else {
      setState(prev => ({ ...prev, fields: [...prev.fields, field] }));
    }
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...state.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setState(prev => ({ ...prev, fields: newFields }));
  };

  const moveVariant = (index: number, direction: 'up' | 'down') => {
    const newIds = [...state.specificVariantIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newIds.length) return;
    
    [newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]];
    setState(prev => ({ ...prev, specificVariantIds: newIds }));
  };

  const tabs = [
    { id: 'config', label: 'Config', icon: Settings },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'fields', label: 'Fields', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'code', label: 'Code', icon: Code },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-bottom border-gray-100">
          <h1 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Scalev Editor
          </h1>
          <p className="text-xs text-gray-400 mt-1">Form Builder v1.0</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'}`} />
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy HTML'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'config' && (
            <motion.div 
              key="config"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              <SectionHeader title="Store Configuration" description="Set up your Scalev store credentials and integration endpoints." />
              
              <div className="grid grid-cols-1 gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <InputGroup label="Scalev API Key" value={state.config.apiKey} onChange={v => updateConfig('apiKey', v)} placeholder="sk_..." />
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Search Store Name</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Enter store name to find IDs..."
                        value={storeSearchTerm}
                        onChange={e => setStoreSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && searchStore()}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <button 
                      onClick={searchStore}
                      disabled={searchingStore || !state.config.apiKey}
                      className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {searchingStore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Search
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {storeNotFound && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        <p className="text-xs font-medium">Store not found. Please check the name and your API Key.</p>
                      </motion.div>
                    )}

                    {storeSearchResults.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 border border-emerald-100 rounded-lg overflow-hidden divide-y divide-emerald-50 bg-emerald-50/30"
                      >
                        {storeSearchResults.map(store => (
                          <div 
                            key={store.id}
                            onClick={() => selectStore(store)}
                            className="p-3 hover:bg-emerald-50 cursor-pointer transition-colors flex items-center justify-between group"
                          >
                            <div>
                              <p className="text-sm font-bold text-gray-800">{store.name}</p>
                              <p className="text-[10px] text-gray-500">Unique ID: {store.unique_id} • Integer ID: {store.id}</p>
                            </div>
                            <div className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                              Select Store
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {state.config.storeName && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Selected Store</p>
                        <p className="text-sm font-bold text-gray-800">{state.config.storeName}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-[10px] text-gray-400">ID: {state.config.storeIntId}</p>
                        <p className="text-[10px] text-gray-400">UID: {state.config.storeId}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <InputGroup label="WhatsApp Number" value={state.config.waNumber} onChange={v => updateConfig('waNumber', v)} placeholder="628..." />
                  <InputGroup label="n8n Webhook URL" value={state.config.n8nWebhook} onChange={v => updateConfig('n8nWebhook', v)} placeholder="https://..." />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div 
              key="products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              <SectionHeader title="Product Display" description="Choose which products to show on your form." />
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">General Product Settings</p>
                    <InputGroup 
                      label="Product Section Title" 
                      value={state.productSectionTitle} 
                      onChange={v => setState(prev => ({ ...prev, productSectionTitle: v }))} 
                      placeholder="e.g. Pilih Isi" 
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <Toggle 
                      label="Auto-select First Product" 
                      description="Automatically select the first item on load"
                      checked={state.autoSelectFirst} 
                      onChange={v => setState(prev => ({ ...prev, autoSelectFirst: v }))} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Toggle 
                    label="Allow Multiple Selection" 
                    description="Let customers pick more than one product"
                    checked={state.allowMultiSelect} 
                    onChange={v => setState(prev => ({ ...prev, allowMultiSelect: v }))} 
                  />
                  <Toggle 
                    label="Show Promo Badge" 
                    description='Show "Gratis 1 Botol" notification'
                    checked={state.showPromoBadge} 
                    onChange={v => setState(prev => ({ ...prev, showPromoBadge: v }))} 
                  />
                  {state.showPromoBadge && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-2"
                    >
                      <InputGroup 
                        label="Upsell Text (Qty = 1)" 
                        value={state.promoUpsellText} 
                        onChange={v => setState(prev => ({ ...prev, promoUpsellText: v }))} 
                        placeholder="e.g. Tambah 1 lagi untuk dapat Gratis 1 Botol" 
                      />
                      <InputGroup 
                        label="Success Text (Qty > 1)" 
                        value={state.promoSuccessText} 
                        onChange={v => setState(prev => ({ ...prev, promoSuccessText: v }))} 
                        placeholder="e.g. Yeeyy... Kamu dapat Gratis 1 Botol" 
                      />
                    </motion.div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Selection Mode</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setState(prev => ({ ...prev, productMode: 'all' }))}
                      className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                        state.productMode === 'all' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Show All Products
                    </button>
                    <button 
                      onClick={() => setState(prev => ({ ...prev, productMode: 'specific' }))}
                      className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                        state.productMode === 'specific' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Specific Products
                    </button>
                  </div>
                </div>

                {state.productMode === 'specific' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div className="border border-gray-100 rounded-lg divide-y divide-gray-100">
                      {loadingProducts ? (
                        <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <p className="text-sm">Loading products...</p>
                        </div>
                      ) : products.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <p className="text-sm">No products found. Check your API Key and Store ID.</p>
                        </div>
                      ) : (
                        products
                          .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map(product => {
                            const variants = product.variants || product.product_variants || [];
                            const selectedCount = variants.filter((v: any) => state.specificVariantIds.includes(String(v.unique_id || v.id))).length;
                            const isAllSelected = variants.length > 0 && selectedCount === variants.length;
                            const isExpanded = expandedProducts.includes(String(product.id));

                            return (
                              <div key={product.id} className="flex flex-col border-b border-gray-100 last:border-0">
                                <div 
                                  className={`p-3 flex items-center gap-3 transition-colors hover:bg-gray-50 ${
                                    isAllSelected ? 'bg-emerald-50/30' : ''
                                  }`}
                                >
                                  <div 
                                    onClick={() => toggleAllVariants(product)}
                                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all ${
                                      isAllSelected
                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                        : selectedCount > 0
                                        ? 'bg-emerald-100 border-emerald-500 text-emerald-600'
                                        : 'border-gray-300 bg-white'
                                    }`}
                                  >
                                    {isAllSelected ? <Check className="w-3 h-3" /> : selectedCount > 0 ? <div className="w-2 h-0.5 bg-emerald-600 rounded-full" /> : null}
                                  </div>
                                  
                                  <div className="flex-1 cursor-pointer" onClick={() => toggleExpandProduct(String(product.id))}>
                                    <p className="text-sm font-bold text-gray-800">{product.name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Product ID: {product.id} • {variants.length} Variants</p>
                                  </div>

                                  <button 
                                    onClick={() => toggleExpandProduct(String(product.id))}
                                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400"
                                  >
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </button>
                                </div>
                                
                                <AnimatePresence>
                                  {isExpanded && variants.length > 0 && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden bg-gray-50/50"
                                    >
                                      <div className="pl-11 pr-3 py-2 space-y-1 border-t border-gray-100/50">
                                        {variants.map((variant: any) => {
                                          const vid = String(variant.unique_id || variant.id);
                                          const isSelected = state.specificVariantIds.includes(vid);
                                          return (
                                            <div 
                                              key={vid}
                                              onClick={() => toggleVariantSelection(vid)}
                                              className="flex items-center gap-3 py-2 cursor-pointer group"
                                            >
                                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                isSelected
                                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                                  : 'border-gray-300 bg-white group-hover:border-emerald-400'
                                              }`}>
                                                {isSelected && <Check className="w-2.5 h-2.5" />}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-600 truncate">{variant.name || 'Default Variant'}</p>
                                                <p className="text-[10px] text-gray-400">Rp {Number(variant.price || 0).toLocaleString('id-ID')}</p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Selected: {state.specificVariantIds.length} variants</p>
                  </motion.div>
                )}

                {state.productMode === 'specific' && state.specificVariantIds.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="pt-6 border-t border-gray-100 space-y-4"
                  >
                    <SectionHeader title="Selected Variants Order" description="Reorder the products as they will appear on the form." />
                    <div className="grid grid-cols-1 gap-2">
                      {state.specificVariantIds.map((vid, idx) => {
                        // Find variant info from products list
                        let variantInfo: any = null;
                        let parentProduct: any = null;
                        
                        for (const p of products) {
                          const variants = p.variants || p.product_variants || [];
                          const found = variants.find((v: any) => String(v.unique_id || v.id) === vid);
                          if (found) {
                            variantInfo = found;
                            parentProduct = p;
                            break;
                          }
                        }

                        if (!variantInfo) return null;

                        return (
                          <div key={vid} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center gap-3 group">
                            <div className="flex flex-col gap-0.5">
                              <button 
                                disabled={idx === 0}
                                onClick={() => moveVariant(idx, 'up')}
                                className="p-0.5 hover:bg-white rounded disabled:opacity-20 transition-colors"
                              >
                                <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                              <button 
                                disabled={idx === state.specificVariantIds.length - 1}
                                onClick={() => moveVariant(idx, 'down')}
                                className="p-0.5 hover:bg-white rounded disabled:opacity-20 transition-colors"
                              >
                                <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                            </div>
                            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-emerald-600 font-bold text-xs border border-gray-100">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">{parentProduct.name}</p>
                              <p className="text-[10px] text-gray-500 truncate">{variantInfo.name || 'Default Variant'}</p>
                            </div>
                            <button 
                              onClick={() => toggleVariantSelection(vid)}
                              className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'fields' && (
            <motion.div 
              key="fields"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <div className="space-y-4">
                <SectionHeader title="Shipping Settings" description="Configure how shipping works on your form." />
                <div className="max-w-md">
                  <Toggle 
                    label="Enable Shipping Courier" 
                    description="Allow customers to choose shipping courier"
                    checked={state.showCourier} 
                    onChange={v => setState(prev => ({ ...prev, showCourier: v }))} 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <SectionHeader title="Available Fields" description="Toggle fields to add or remove them from your form." />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {AVAILABLE_FIELDS.map((field, idx) => {
                    const isSelected = state.fields.some(f => f.id === field.id);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => toggleField(field)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                          isSelected 
                            ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                            : 'bg-white border-gray-200 hover:border-emerald-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${isSelected ? 'text-emerald-900' : 'text-gray-700'}`}>
                            {field.label}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                            {field.type}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <SectionHeader title="Active Form Fields" description="Reorder the fields by moving them up or down." />
                <div className="grid grid-cols-1 gap-3">
                  {state.fields.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400">
                      No fields selected. Choose from available fields above.
                    </div>
                  ) : (
                    state.fields.map((field, idx) => (
                      <div key={field.id} className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-4 group">
                        <div className="flex flex-col gap-1">
                          <button 
                            disabled={idx === 0}
                            onClick={() => moveField(idx, 'up')}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                          >
                            <ArrowUp className="w-4 h-4 text-gray-500" />
                          </button>
                          <button 
                            disabled={idx === state.fields.length - 1}
                            onClick={() => moveField(idx, 'down')}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                          >
                            <ArrowDown className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">{field.label}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                            Type: {field.type} {field.required ? '• Required' : ''}
                          </p>
                        </div>
                        <button 
                          onClick={() => toggleField(field)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <SectionHeader title="Post-Order Action" description="Choose what happens after a customer successfully places an order." />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div 
                    onClick={() => setState(prev => ({ ...prev, afterOrderAction: 'whatsapp' }))}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                      state.afterOrderAction === 'whatsapp' 
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      state.afterOrderAction === 'whatsapp' ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-300'
                    }`}>
                      {state.afterOrderAction === 'whatsapp' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${state.afterOrderAction === 'whatsapp' ? 'text-emerald-900' : 'text-gray-700'}`}>
                        WhatsApp
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        Direct chat
                      </p>
                    </div>
                  </div>
                  <div 
                    onClick={() => setState(prev => ({ ...prev, afterOrderAction: 'order_link' }))}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                      state.afterOrderAction === 'order_link' 
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      state.afterOrderAction === 'order_link' ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-300'
                    }`}>
                      {state.afterOrderAction === 'order_link' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${state.afterOrderAction === 'order_link' ? 'text-emerald-900' : 'text-gray-700'}`}>
                        Order Link
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        Scalev page
                      </p>
                    </div>
                  </div>
                  <div 
                    onClick={() => setState(prev => ({ ...prev, afterOrderAction: 'custom_link' }))}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                      state.afterOrderAction === 'custom_link' 
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      state.afterOrderAction === 'custom_link' ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-300'
                    }`}>
                      {state.afterOrderAction === 'custom_link' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${state.afterOrderAction === 'custom_link' ? 'text-emerald-900' : 'text-gray-700'}`}>
                        Custom Link
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        Tautan bebas
                      </p>
                    </div>
                  </div>
                </div>

                {state.afterOrderAction === 'custom_link' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4"
                  >
                    <InputGroup 
                      label="Custom Redirect URL" 
                      value={state.customRedirectUrl || ""} 
                      onChange={v => setState(prev => ({ ...prev, customRedirectUrl: v }))} 
                      placeholder="https://tokoanda.com/terima-kasih" 
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div 
              key="payments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <div className="space-y-4">
                <SectionHeader title="Available Payment Methods" description="Toggle payment options to add or remove them from your form." />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {AVAILABLE_PAYMENTS.map((pay, idx) => {
                    const isSelected = state.payments.some(p => p.label === pay.label && p.sub === pay.sub);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => togglePayment(pay)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                          isSelected 
                            ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                            : 'bg-white border-gray-200 hover:border-emerald-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="w-12 h-8 bg-gray-50 rounded border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img src={pay.logo} alt={pay.label} className="max-w-full max-h-full object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${isSelected ? 'text-emerald-900' : 'text-gray-700'}`}>
                            {pay.label}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                            {pay.badge}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <SectionHeader title="Active Payment Methods" description="Reorder the payment methods by moving them up or down." />
                <div className="grid grid-cols-1 gap-3">
                  {state.payments.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400">
                      No payment methods selected. Choose from available options above.
                    </div>
                  ) : (
                    state.payments.map((pay, idx) => (
                      <div key={`${pay.id}-${pay.sub}-${idx}`} className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-4 group">
                        <div className="flex flex-col gap-1">
                          <button 
                            disabled={idx === 0}
                            onClick={() => movePayment(idx, 'up')}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                          >
                            <ArrowUp className="w-4 h-4 text-gray-500" />
                          </button>
                          <button 
                            disabled={idx === state.payments.length - 1}
                            onClick={() => movePayment(idx, 'down')}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                          >
                            <ArrowDown className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold">
                          {idx + 1}
                        </div>
                        <div className="w-12 h-8 bg-gray-50 rounded border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img src={pay.logo} alt={pay.label} className="max-w-full max-h-full object-contain p-1" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">{pay.label}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                            {pay.badge}
                          </p>
                        </div>
                        <button 
                          onClick={() => togglePayment(pay)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col gap-4"
            >
              <SectionHeader title="Live Preview" description="See how your form looks with the current settings." />
              <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
                <iframe 
                  srcDoc={generatedHTML}
                  title="Preview"
                  className="w-full h-full border-none"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'code' && (
            <motion.div 
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <SectionHeader title="Generated HTML" description="Copy this code and paste it into your landing page." />
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                <pre className="p-6 text-emerald-400 font-mono text-sm h-full overflow-auto">
                  {generatedHTML}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string, description: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}

function Toggle({ label, checked, onChange, description }: { label: string, checked: boolean, onChange: (v: boolean) => void, description?: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div>
        <p className="text-sm font-bold text-gray-900">{label}</p>
        {description && <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          checked ? 'bg-emerald-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder, type = 'text' }: { 
  label: string, 
  value: string | number, 
  onChange: (v: string) => void,
  placeholder?: string,
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
      />
    </div>
  );
}
