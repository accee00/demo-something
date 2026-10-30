import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, AlertTriangle, ArrowRight, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export function DemoStoreTarget({ isRefactored, onToggleRefactor }) {
  const [inCart, setInCart] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleAddToBag = () => {
    setInCart(true);
    setDrawerOpen(true);
    setOrderPlaced(false);
  };

  const handleCheckout = () => {
    setOrderPlaced(true);
  };

  const handleReset = () => {
    setInCart(false);
    setDrawerOpen(false);
    setOrderPlaced(false);
  };

  return (
    <div className="bg-[#0f0f0f] border border-[#222222] rounded-lg p-5">
      {/* Title & Refactor Toggle Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-[#222] pb-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-gray-300" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Target Web Application Testbed</h2>
        </div>

        {/* Refactor Mutation Switch */}
        <button
          onClick={onToggleRefactor}
          className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono transition-all ${
            isRefactored
              ? 'bg-white text-black border-white font-bold shadow-md'
              : 'bg-[#181818] text-gray-300 border-[#333] hover:border-gray-500'
          }`}
        >
          {isRefactored ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}
          <span>{isRefactored ? 'REFACTOR MODE: ON (IDs Mutated)' : 'REFACTOR MODE: OFF (Normal UI)'}</span>
        </button>
      </div>

      {/* Target App Simulation Canvas */}
      <div className="bg-[#121212] border border-[#262626] rounded-md p-4 relative min-h-[300px]">
        {/* Top Mini Navbar of Target Store */}
        <div className="flex items-center justify-between border-b border-[#222] pb-2.5 mb-4">
          <div className="font-extrabold text-xs tracking-wider text-white">QUANTUM FOOTWEAR LABS</div>
          <div className="flex items-center gap-2">
            <button
              id="cart-drawer-trigger"
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="text-xs font-mono bg-[#1c1c1c] hover:bg-[#252525] px-2.5 py-1 rounded border border-[#333] text-gray-300 flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart ({inCart ? 1 : 0})</span>
            </button>
            <button
              onClick={handleReset}
              className="text-[10px] font-mono text-gray-500 hover:text-gray-300"
              title="Reset state"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Product Card */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-[#0a0a0a] border border-[#222] rounded p-4 mb-4">
          <div className="w-24 h-24 bg-[#1a1a1a] border border-[#333] rounded flex items-center justify-center text-3xl">
            👟
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-white">Quantum Ultra Running Shoes</span>
              <span className="text-[10px] bg-white text-black font-mono font-bold px-1.5 py-0.2 rounded">BESTSELLER</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">High-performance responsive carbon fiber sole with adaptive cushioning.</p>
            <div className="text-sm font-mono font-bold text-white mb-2">$149.00 USD</div>
            <button
              id="add-to-bag-shoes"
              onClick={handleAddToBag}
              className="bg-white hover:bg-gray-200 text-black font-mono text-xs font-bold py-1.5 px-4 rounded transition-colors"
            >
              {inCart ? 'Item in Bag &check;' : 'Add to Bag'}
            </button>
          </div>
        </div>

        {/* Cart Drawer Modal */}
        {drawerOpen && (
          <div id="cart-drawer" className="bg-[#141414] border border-[#333] rounded p-4 mb-4">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-2 mb-3">
              <h3 className="cart-title text-xs font-bold uppercase tracking-wider text-white">Shopping Bag</h3>
              <span className="cart-total-price font-mono text-xs font-bold text-white">$149.00</span>
            </div>

            {inCart ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">1 &times; Quantum Ultra Running Shoes</span>

                {/* The Crucial Button: Shows old vs new locator depending on isRefactored */}
                {isRefactored ? (
                  <div>
                    <button
                      id="place-order-v2"
                      onClick={handleCheckout}
                      className="btn-primary-checkout-revamp bg-black border border-white hover:bg-white hover:text-black text-white font-mono text-xs font-bold px-4 py-2 rounded transition-all shadow-lg flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-gray-300" />
                      <span>Complete Order &amp; Pay</span>
                    </button>
                    <div className="text-[9px] font-mono text-gray-400 mt-1 text-right">
                      Locator: <code className="text-white">#place-order-v2</code>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      id="checkout-btn"
                      onClick={handleCheckout}
                      className="bg-white hover:bg-gray-200 text-black font-mono text-xs font-bold px-4 py-2 rounded transition-colors"
                    >
                      Checkout &rarr;
                    </button>
                    <div className="text-[9px] font-mono text-gray-400 mt-1 text-right">
                      Locator: <code className="text-white">#checkout-btn</code>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 font-mono">Your shopping bag is empty.</p>
            )}
          </div>
        )}

        {/* Order Success Confirmation Banner */}
        {orderPlaced && (
          <div className="bg-[#0e2a16] border border-[#1b6232] rounded p-3 text-center animate-fade-in">
            <div className="flex items-center justify-center gap-1.5 text-green-400 font-mono text-xs font-bold mb-1">
              <CheckCircle className="w-4 h-4" />
              <span id="order-status-msg">Order Placed Successfully!</span>
            </div>
            <p className="text-[11px] text-gray-300 font-mono">Confirmation #QNTM-8921 sent to test inbox.</p>
          </div>
        )}

        {/* Live DOM Inspector Pill */}
        <div className="mt-3 pt-2 border-t border-[#222] flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span>TESTBED TARGET DOM STATUS: {isRefactored ? 'MUTATED (v2)' : 'BASELINE (v1)'}</span>
          <span>CURRENT CHECKOUT SELECTOR: {isRefactored ? '#place-order-v2' : '#checkout-btn'}</span>
        </div>
      </div>
    </div>
  );
}

