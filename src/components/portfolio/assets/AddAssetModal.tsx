"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { addAsset } from "@/lib/portfolio";
import type {
  AssetType,
  PortfolioAsset,
  FixedAsset,
  FixedDeposit,
  SavingsAccount,
  MutualFund,
  TreasuryBond,
} from "@/types";

interface AddAssetModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAssetModal({
  onClose,
  onSuccess,
}: AddAssetModalProps) {
  const { user } = useAuth();
  const { refreshPortfolio } = usePortfolio();

  const [type, setType] = useState<AssetType>("fixed-asset");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Common helpers
  const num = (v: string) => Number((v || "").replace(/,/g, "").trim());
  const today = new Date().toISOString().split("T")[0];

  // Type-specific state
  const [faCategory, setFaCategory] = useState<
    "land" | "gold" | "property" | "vehicle" | "jewelry" | "art" | "other"
  >("land");
  const [faPurchaseDate, setFaPurchaseDate] = useState(today);
  const [faPurchasePrice, setFaPurchasePrice] = useState("");
  const [faCurrentValue, setFaCurrentValue] = useState("");
  const [faAppraisalDate, setFaAppraisalDate] = useState("");
  const [faDetails, setFaDetails] = useState("");
  const [faInsuranceValue, setFaInsuranceValue] = useState("");
  const [faDepreciationRate, setFaDepreciationRate] = useState("");

  const [fdBank, setFdBank] = useState("");
  const [fdAccountNumber, setFdAccountNumber] = useState("");
  const [fdPrincipal, setFdPrincipal] = useState("");
  const [fdRate, setFdRate] = useState("");
  const [fdComp, setFdComp] = useState<
    "simple" | "monthly" | "quarterly" | "annually"
  >("monthly");
  const [fdStart, setFdStart] = useState(today);
  const [fdMaturity, setFdMaturity] = useState("");
  const [fdAuto, setFdAuto] = useState(true);

  const [svBank, setSvBank] = useState("");
  const [svAccountNumber, setSvAccountNumber] = useState("");
  const [svAccountType, setSvAccountType] = useState<
    "regular" | "high-yield" | "business" | "joint" | "other"
  >("regular");
  const [svBalance, setSvBalance] = useState("");
  const [svRate, setSvRate] = useState("");
  const [svUpdated, setSvUpdated] = useState(today);
  const [svMinimumBalance, setSvMinimumBalance] = useState("");
  const [svMonthlyFee, setSvMonthlyFee] = useState("");

  const [mfCode, setMfCode] = useState("");
  const [mfManager, setMfManager] = useState("");
  const [mfCategory, setMfCategory] = useState<
    "equity" | "debt" | "balanced" | "index" | "sectoral" | "other"
  >("equity");
  const [mfUnits, setMfUnits] = useState("");
  const [mfBuyNav, setMfBuyNav] = useState("");
  const [mfLastNav, setMfLastNav] = useState("");
  const [mfLastNavDate, setMfLastNavDate] = useState("");
  const [mfExpenseRatio, setMfExpenseRatio] = useState("");
  const [mfDividendFreq, setMfDividendFreq] = useState<
    "monthly" | "quarterly" | "annual" | "none"
  >("annual");

  const [tbIssue, setTbIssue] = useState("");
  const [tbIssuer, setTbIssuer] = useState<
    "government" | "corporate" | "municipal"
  >("government");
  const [tbFace, setTbFace] = useState("");
  const [tbUnits, setTbUnits] = useState("");
  const [tbCoupon, setTbCoupon] = useState("");
  const [tbFreq, setTbFreq] = useState<"annual" | "semi-annual" | "quarterly">(
    "semi-annual"
  );
  const [tbPurchasePrice, setTbPurchasePrice] = useState("");
  const [tbPurchaseDate, setTbPurchaseDate] = useState("");
  const [tbMaturityDate, setTbMaturityDate] = useState("");
  const [tbMarketPrice, setTbMarketPrice] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in");
      return;
    }
    if (!name.trim()) {
      setError("Please provide a name");
      return;
    }

    setError("");
    setLoading(true);

    try {
      let payload: Omit<
        PortfolioAsset,
        "id" | "userId" | "createdAt" | "updatedAt"
      > | null = null;

      if (type === "fixed-asset") {
        if (!faPurchasePrice) {
          setError("Enter purchase price");
          setLoading(false);
          return;
        }
        const obj: Omit<
          FixedAsset,
          "id" | "userId" | "createdAt" | "updatedAt"
        > = {
          type,
          name: name.trim(),
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
          tags: tags.filter((t) => t.trim()),
          category: faCategory,
          purchaseDate: faPurchaseDate,
          purchasePrice: num(faPurchasePrice),
          currentValue: faCurrentValue ? num(faCurrentValue) : undefined,
          appraisalDate: faAppraisalDate || undefined,
          locationOrDetails: faDetails || undefined,
          insuranceValue: faInsuranceValue ? num(faInsuranceValue) : undefined,
          depreciationRate: faDepreciationRate
            ? num(faDepreciationRate)
            : undefined,
        };
        payload = obj;
      } else if (type === "fixed-deposit") {
        if (!fdBank || !fdPrincipal || !fdRate || !fdStart) {
          setError("Fill bank, principal, rate and start date");
          setLoading(false);
          return;
        }
        const obj: Omit<
          FixedDeposit,
          "id" | "userId" | "createdAt" | "updatedAt"
        > = {
          type,
          name: name.trim(),
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
          tags: tags.filter((t) => t.trim()),
          bank: fdBank,
          accountNumber: fdAccountNumber || undefined,
          principal: num(fdPrincipal),
          interestRate: num(fdRate),
          compounding: fdComp,
          startDate: fdStart,
          maturityDate: fdMaturity || "",
          autoRenewal: fdAuto,
        };
        payload = obj;
      } else if (type === "savings") {
        if (!svBank || !svBalance) {
          setError("Fill bank and balance");
          setLoading(false);
          return;
        }
        const obj: Omit<
          SavingsAccount,
          "id" | "userId" | "createdAt" | "updatedAt"
        > = {
          type,
          name: name.trim(),
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
          tags: tags.filter((t) => t.trim()),
          bank: svBank,
          accountNumber: svAccountNumber || undefined,
          accountType: svAccountType,
          balance: num(svBalance),
          interestRate: svRate ? num(svRate) : undefined,
          lastUpdated: svUpdated || undefined,
          minimumBalance: svMinimumBalance ? num(svMinimumBalance) : undefined,
          monthlyFee: svMonthlyFee ? num(svMonthlyFee) : undefined,
        };
        payload = obj;
      } else if (type === "mutual-fund") {
        if (!mfUnits) {
          setError("Enter units");
          setLoading(false);
          return;
        }
        const obj: Omit<
          MutualFund,
          "id" | "userId" | "createdAt" | "updatedAt"
        > = {
          type,
          name: name.trim(),
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
          tags: tags.filter((t) => t.trim()),
          fundCode: mfCode || undefined,
          fundManager: mfManager || undefined,
          category: mfCategory,
          units: num(mfUnits),
          buyNav: mfBuyNav ? num(mfBuyNav) : undefined,
          lastNav: mfLastNav ? num(mfLastNav) : undefined,
          lastNavDate: mfLastNavDate || undefined,
          expenseRatio: mfExpenseRatio ? num(mfExpenseRatio) : undefined,
          dividendFrequency: mfDividendFreq,
        };
        payload = obj;
      } else if (type === "treasury-bond") {
        if (!tbUnits || !tbFace || !tbMaturityDate) {
          setError("Enter units, face value and maturity date");
          setLoading(false);
          return;
        }
        const obj: Omit<
          TreasuryBond,
          "id" | "userId" | "createdAt" | "updatedAt"
        > = {
          type,
          name: name.trim(),
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
          tags: tags.filter((t) => t.trim()),
          issueCode: tbIssue || undefined,
          issuer: tbIssuer,
          faceValue: num(tbFace),
          units: num(tbUnits),
          couponRate: tbCoupon ? num(tbCoupon) : undefined,
          couponFrequency: tbFreq,
          purchasePrice: tbPurchasePrice ? num(tbPurchasePrice) : undefined,
          purchaseDate: tbPurchaseDate || undefined,
          maturityDate: tbMaturityDate,
          currentMarketPrice: tbMarketPrice ? num(tbMarketPrice) : undefined,
        };
        payload = obj;
      }

      if (!payload) throw new Error("Invalid asset data");
      await addAsset(user.uid, payload);
      await refreshPortfolio();
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add asset";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderTypeFields = () => {
    switch (type) {
      case "fixed-asset":
        return (
          <div className='space-y-3'>
            <div>
              <label className='block text-sm mb-1'>Category</label>
              <select
                value={faCategory}
                onChange={(e) =>
                  setFaCategory(e.target.value as typeof faCategory)
                }
                className='w-full px-3 py-2 border rounded-lg'
              >
                <option value='land'>Land</option>
                <option value='gold'>Gold</option>
                <option value='property'>Property</option>
                <option value='vehicle'>Vehicle</option>
                <option value='jewelry'>Jewelry</option>
                <option value='art'>Art</option>
                <option value='other'>Other</option>
              </select>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm mb-1'>Purchase Date</label>
                <input
                  type='date'
                  value={faPurchaseDate}
                  onChange={(e) => setFaPurchaseDate(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>
                  Purchase Price (LKR)
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={faPurchasePrice}
                  onChange={(e) => setFaPurchasePrice(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div>
                <label className='block text-sm mb-1'>
                  Current Value (LKR)
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={faCurrentValue}
                  onChange={(e) => setFaCurrentValue(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>
                  Insurance Value (LKR)
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={faInsuranceValue}
                  onChange={(e) => setFaInsuranceValue(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>
                  Depreciation Rate (%)
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={faDepreciationRate}
                  onChange={(e) => setFaDepreciationRate(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm mb-1'>Appraisal Date</label>
                <input
                  type='date'
                  value={faAppraisalDate}
                  onChange={(e) => setFaAppraisalDate(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Details</label>
                <input
                  type='text'
                  value={faDetails}
                  onChange={(e) => setFaDetails(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Address / description (optional)'
                />
              </div>
            </div>
          </div>
        );
      case "fixed-deposit":
        return (
          <div className='space-y-3'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm mb-1'>Bank</label>
                <input
                  type='text'
                  value={fdBank}
                  onChange={(e) => setFdBank(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Account Number</label>
                <input
                  type='text'
                  value={fdAccountNumber}
                  onChange={(e) => setFdAccountNumber(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm mb-1'>Principal (LKR)</label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={fdPrincipal}
                  onChange={(e) => setFdPrincipal(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>
                  Interest Rate (% p.a.)
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={fdRate}
                  onChange={(e) => setFdRate(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div>
                <label className='block text-sm mb-1'>Compounding</label>
                <select
                  value={fdComp}
                  onChange={(e) => setFdComp(e.target.value as typeof fdComp)}
                  className='w-full px-3 py-2 border rounded-lg'
                >
                  <option value='simple'>Simple</option>
                  <option value='monthly'>Monthly</option>
                  <option value='quarterly'>Quarterly</option>
                  <option value='annually'>Annually</option>
                </select>
              </div>
              <div>
                <label className='block text-sm mb-1'>Start Date</label>
                <input
                  type='date'
                  value={fdStart}
                  onChange={(e) => setFdStart(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Maturity Date</label>
                <input
                  type='date'
                  value={fdMaturity}
                  onChange={(e) => setFdMaturity(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <input
                id='fd-auto'
                type='checkbox'
                checked={fdAuto}
                onChange={(e) => setFdAuto(e.target.checked)}
              />
              <label htmlFor='fd-auto' className='text-sm'>
                Auto Renew
              </label>
            </div>
          </div>
        );
      case "savings":
        return (
          <div className='space-y-3'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm mb-1'>Bank</label>
                <input
                  type='text'
                  value={svBank}
                  onChange={(e) => setSvBank(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Account Number</label>
                <input
                  type='text'
                  value={svAccountNumber}
                  onChange={(e) => setSvAccountNumber(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm mb-1'>Account Type</label>
                <select
                  value={svAccountType}
                  onChange={(e) =>
                    setSvAccountType(e.target.value as typeof svAccountType)
                  }
                  className='w-full px-3 py-2 border rounded-lg'
                >
                  <option value='regular'>Regular</option>
                  <option value='high-yield'>High Yield</option>
                  <option value='business'>Business</option>
                  <option value='joint'>Joint</option>
                  <option value='other'>Other</option>
                </select>
              </div>
              <div>
                <label className='block text-sm mb-1'>Balance (LKR)</label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={svBalance}
                  onChange={(e) => setSvBalance(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div>
                <label className='block text-sm mb-1'>
                  Interest Rate (% p.a.)
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={svRate}
                  onChange={(e) => setSvRate(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>
                  Minimum Balance (LKR)
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={svMinimumBalance}
                  onChange={(e) => setSvMinimumBalance(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Monthly Fee (LKR)</label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={svMonthlyFee}
                  onChange={(e) => setSvMonthlyFee(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm mb-1'>Last Updated</label>
              <input
                type='date'
                value={svUpdated}
                onChange={(e) => setSvUpdated(e.target.value)}
                className='w-full px-3 py-2 border rounded-lg'
              />
            </div>
          </div>
        );
      case "mutual-fund":
        return (
          <div className='space-y-3'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm mb-1'>Fund Code / ISIN</label>
                <input
                  type='text'
                  value={mfCode}
                  onChange={(e) => setMfCode(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Fund Manager</label>
                <input
                  type='text'
                  value={mfManager}
                  onChange={(e) => setMfManager(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm mb-1'>Category</label>
                <select
                  value={mfCategory}
                  onChange={(e) =>
                    setMfCategory(e.target.value as typeof mfCategory)
                  }
                  className='w-full px-3 py-2 border rounded-lg'
                >
                  <option value='equity'>Equity</option>
                  <option value='debt'>Debt</option>
                  <option value='balanced'>Balanced</option>
                  <option value='index'>Index</option>
                  <option value='sectoral'>Sectoral</option>
                  <option value='other'>Other</option>
                </select>
              </div>
              <div>
                <label className='block text-sm mb-1'>Units</label>
                <input
                  type='number'
                  min='0'
                  step='0.0001'
                  value={mfUnits}
                  onChange={(e) => setMfUnits(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div>
                <label className='block text-sm mb-1'>Buy NAV</label>
                <input
                  type='number'
                  min='0'
                  step='0.0001'
                  value={mfBuyNav}
                  onChange={(e) => setMfBuyNav(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Last NAV</label>
                <input
                  type='number'
                  min='0'
                  step='0.0001'
                  value={mfLastNav}
                  onChange={(e) => setMfLastNav(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Expense Ratio (%)</label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={mfExpenseRatio}
                  onChange={(e) => setMfExpenseRatio(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm mb-1'>Last NAV Date</label>
                <input
                  type='date'
                  value={mfLastNavDate}
                  onChange={(e) => setMfLastNavDate(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Dividend Frequency</label>
                <select
                  value={mfDividendFreq}
                  onChange={(e) =>
                    setMfDividendFreq(e.target.value as typeof mfDividendFreq)
                  }
                  className='w-full px-3 py-2 border rounded-lg'
                >
                  <option value='monthly'>Monthly</option>
                  <option value='quarterly'>Quarterly</option>
                  <option value='annual'>Annual</option>
                  <option value='none'>None</option>
                </select>
              </div>
            </div>
          </div>
        );
      case "treasury-bond":
        return (
          <div className='space-y-3'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm mb-1'>Issue Code</label>
                <input
                  type='text'
                  value={tbIssue}
                  onChange={(e) => setTbIssue(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Issuer</label>
                <select
                  value={tbIssuer}
                  onChange={(e) =>
                    setTbIssuer(e.target.value as typeof tbIssuer)
                  }
                  className='w-full px-3 py-2 border rounded-lg'
                >
                  <option value='government'>Government</option>
                  <option value='corporate'>Corporate</option>
                  <option value='municipal'>Municipal</option>
                </select>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm mb-1'>
                  Face Value (per unit)
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={tbFace}
                  onChange={(e) => setTbFace(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Units</label>
                <input
                  type='number'
                  min='0'
                  step='1'
                  value={tbUnits}
                  onChange={(e) => setTbUnits(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm mb-1'>
                  Coupon Rate (% p.a.)
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={tbCoupon}
                  onChange={(e) => setTbCoupon(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Coupon Frequency</label>
                <select
                  value={tbFreq}
                  onChange={(e) => setTbFreq(e.target.value as typeof tbFreq)}
                  className='w-full px-3 py-2 border rounded-lg'
                >
                  <option value='annual'>Annual</option>
                  <option value='semi-annual'>Semi-annual</option>
                  <option value='quarterly'>Quarterly</option>
                </select>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div>
                <label className='block text-sm mb-1'>
                  Purchase Price (per unit)
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={tbPurchasePrice}
                  onChange={(e) => setTbPurchasePrice(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>
                  Current Market Price (per unit)
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={tbMarketPrice}
                  onChange={(e) => setTbMarketPrice(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
              <div>
                <label className='block text-sm mb-1'>Purchase Date</label>
                <input
                  type='date'
                  value={tbPurchaseDate}
                  onChange={(e) => setTbPurchaseDate(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg'
                  placeholder='Optional'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm mb-1'>Maturity Date</label>
              <input
                type='date'
                value={tbMaturityDate}
                onChange={(e) => setTbMaturityDate(e.target.value)}
                className='w-full px-3 py-2 border rounded-lg'
                placeholder='Optional'
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className='fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'
      role='dialog'
      aria-modal='true'
      aria-labelledby='add-asset-title'
    >
      <div className='relative w-full max-w-2xl mx-auto my-8 rounded-2xl shadow-2xl border backdrop-blur-lg'>
        <div className='sticky top-0 backdrop-blur-lg border-b px-6 py-4 flex justify-between items-center rounded-t-2xl'>
          <h2 id='add-asset-title' className='text-2xl font-bold'>
            Add Portfolio Asset
          </h2>
          <button onClick={onClose} className='transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {error && (
            <div className='p-3 border rounded-lg text-sm'>{error}</div>
          )}

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label className='block text-sm mb-1'>Asset Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AssetType)}
                className='w-full px-3 py-2 border rounded-lg'
              >
                <option value='fixed-asset'>Fixed Asset (Land/Gold)</option>
                <option value='fixed-deposit'>Fixed Deposit</option>
                <option value='savings'>Savings</option>
                <option value='mutual-fund'>Mutual Fund</option>
                <option value='treasury-bond'>Treasury Bond</option>
              </select>
            </div>
            <div>
              <label className='block text-sm mb-1'>Name</label>
              <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-3 py-2 border rounded-lg'
                placeholder='e.g., Land - Kandy / FD - HNB'
              />
            </div>
          </div>

          {/* Type Specific Fields */}
          {renderTypeFields()}

          <div>
            <label className='block text-sm mb-1'>Description</label>
            <input
              type='text'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full px-3 py-2 border rounded-lg'
              placeholder='Optional description'
            />
          </div>

          <div>
            <label className='block text-sm mb-1'>Tags</label>
            <input
              type='text'
              value={tags.join(", ")}
              onChange={(e) =>
                setTags(e.target.value.split(",").map((t) => t.trim()))
              }
              className='w-full px-3 py-2 border rounded-lg'
              placeholder='Comma-separated tags (optional)'
            />
          </div>

          <div>
            <label className='block text-sm mb-1'>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className='w-full px-3 py-2 border rounded-lg'
              placeholder='Optional notes'
            />
          </div>

          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-4 py-2 border rounded-lg font-medium'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-4 py-2 border rounded-lg font-semibold disabled:opacity-50'
            >
              {loading ? "Adding..." : "Add Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
