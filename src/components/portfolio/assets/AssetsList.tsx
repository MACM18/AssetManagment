"use client";

import { useState, useMemo } from "react";
import type { PortfolioAsset } from "@/types";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { deleteAsset, computeAssetMetrics } from "@/lib/portfolio";
import { useAuth } from "@/contexts/AuthContext";
import {
  Trash2,
  Edit3,
  Wallet,
  TrendingUp,
  Building2,
  Banknote,
  Target,
  PiggyBank,
  LineChart,
  FileText,
} from "lucide-react";
import AddAssetModal from "@/components/portfolio/assets/AddAssetModal";

export default function AssetsList() {
  const { assets, assetsSummary, refreshPortfolio } = usePortfolio();
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<PortfolioAsset | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const rows = useMemo(
    () => assets.map((a) => computeAssetMetrics(a)),
    [assets]
  );

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("Delete this asset?")) return;
    setDeletingId(id);
    try {
      await deleteAsset(user.uid, id);
      await refreshPortfolio();
    } catch (e) {
      alert("Failed to delete asset");
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "fixed-asset":
        return <Building2 className='w-4 h-4' />;
      case "fixed-deposit":
        return <Banknote className='w-4 h-4' />;
      case "goal-based-fixed-deposit":
        return <Target className='w-4 h-4' />;
      case "savings":
        return <PiggyBank className='w-4 h-4' />;
      case "mutual-fund":
        return <LineChart className='w-4 h-4' />;
      case "treasury-bond":
        return <FileText className='w-4 h-4' />;
      default:
        return <Wallet className='w-4 h-4' />;
    }
  };

  return (
    <div className='rounded-xl shadow-lg border border-border bg-card hover:shadow-xl transition-shadow'>
      <div className='p-6 border-b border-border bg-secondary/20'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='p-2 rounded-full bg-primary/10 border border-primary/30'>
            <Wallet className='w-5 h-5 text-primary' />
          </div>
          <h2 className='text-xl font-bold text-foreground'>Other Assets</h2>
        </div>
        {assetsSummary && (
          <div className='flex items-center gap-2 mt-3'>
            <TrendingUp className='w-4 h-4 text-muted-foreground' />
            <p className='text-sm text-muted-foreground font-medium'>
              Total Value:{" "}
              <span className='text-foreground font-bold'>
                LKR{" "}
                {assetsSummary.totalCurrentValue.toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className='p-12 text-center'>
          <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center'>
            <Wallet className='w-8 h-8 text-muted-foreground' />
          </div>
          <p className='text-muted-foreground font-medium'>
            No assets added yet
          </p>
          <p className='text-sm mt-2 text-muted-foreground'>
            Track your fixed deposits, savings accounts, and other investments
            here
          </p>
        </div>
      ) : (
        <div className='divide-y divide-border'>
          {rows.map((a) => (
            <div
              key={a.id}
              className='p-6 transition-colors hover:bg-secondary/5'
            >
              <div className='flex justify-between items-start gap-4'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='text-xs px-2 py-1 border border-primary/30 bg-primary/10 text-primary rounded-full capitalize font-semibold flex items-center gap-1.5'>
                      {getAssetIcon(a.type)}
                      {a.type.replace("-", " ")}
                    </span>
                    <h3 className='text-lg font-bold truncate text-foreground'>
                      {a.name}
                    </h3>
                  </div>
                  {a.notes && (
                    <p className='text-sm mt-1 text-muted-foreground italic bg-muted/20 p-2 rounded truncate'>
                      {a.notes}
                    </p>
                  )}
                </div>
                <div className='text-right bg-primary/5 p-3 rounded-lg border border-primary/20'>
                  <div className='text-xs text-muted-foreground mb-1'>
                    Current Value
                  </div>
                  <div className='font-bold text-foreground'>
                    LKR{" "}
                    {a.currentValue.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>

              {/* details */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 bg-secondary/5 p-4 rounded-lg border border-border'>
                {a.type === "fixed-asset" && (
                  <>
                    <Detail label='Category' value={a.category} />
                    <Detail label='Purchased' value={a.purchaseDate} />
                    <Detail
                      label='Purchase Price'
                      value={`LKR ${a.purchasePrice.toLocaleString("en-LK", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                    />
                    {a.currentValue !== undefined && (
                      <Detail
                        label='Appraised'
                        value={a.appraisalDate || "-"}
                      />
                    )}
                  </>
                )}
                {a.type === "fixed-deposit" && (
                  <>
                    <Detail label='Bank' value={a.bank} />
                    <Detail
                      label='Principal'
                      value={`LKR ${a.principal.toLocaleString("en-LK", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                    />
                    <Detail label='Rate' value={`${a.interestRate}% p.a.`} />
                    <Detail
                      label='Term'
                      value={`${a.startDate} → ${a.maturityDate || "—"}`}
                    />
                  </>
                )}
                {a.type === "goal-based-fixed-deposit" && (
                  <>
                    <Detail label='Bank' value={a.bank} />
                    <Detail
                      label='Principal'
                      value={`LKR ${a.principal.toLocaleString("en-LK", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                    />
                    <Detail label='Rate' value={`${a.interestRate}% p.a.`} />
                    <Detail label='Goal' value={a.goalName} />
                    <Detail
                      label='Target'
                      value={`LKR ${a.goalAmount.toLocaleString("en-LK", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                    />
                  </>
                )}
                {a.type === "savings" && (
                  <>
                    <Detail label='Bank' value={a.bank} />
                    <Detail
                      label='Balance'
                      value={`LKR ${a.balance.toLocaleString("en-LK", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                    />
                    {a.interestRate !== undefined && (
                      <Detail label='Rate' value={`${a.interestRate}% p.a.`} />
                    )}
                    {a.lastUpdated && (
                      <Detail label='Updated' value={a.lastUpdated} />
                    )}
                  </>
                )}
                {a.type === "mutual-fund" && (
                  <>
                    {a.fundCode && <Detail label='Code' value={a.fundCode} />}
                    <Detail label='Units' value={`${a.units}`} />
                    {a.buyNav !== undefined && (
                      <Detail label='Buy NAV' value={String(a.buyNav)} />
                    )}
                    {a.lastNav !== undefined && (
                      <Detail
                        label='Last NAV'
                        value={`${a.lastNav} ${
                          a.lastNavDate ? `(${a.lastNavDate})` : ""
                        }`}
                      />
                    )}
                  </>
                )}
                {a.type === "treasury-bond" && (
                  <>
                    {a.issueCode && (
                      <Detail label='Issue' value={a.issueCode} />
                    )}
                    <Detail label='Units' value={`${a.units}`} />
                    <Detail
                      label='Face Value'
                      value={`LKR ${a.faceValue.toLocaleString("en-LK")}`}
                    />
                    {a.currentMarketPrice !== undefined && (
                      <Detail
                        label='Market Price'
                        value={`LKR ${a.currentMarketPrice.toLocaleString(
                          "en-LK"
                        )}`}
                      />
                    )}
                  </>
                )}
              </div>

              <div className='flex justify-end pt-4 mt-4 border-t border-border'>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => {
                      // find original asset by id
                      const orig = assets.find((x) => x.id === a.id) || null;
                      setEditingAsset(orig);
                      setShowEditModal(true);
                    }}
                    className='p-2 rounded-lg hover:bg-primary/10 border border-border hover:border-primary/30 transition-all text-foreground'
                    title='Edit asset'
                  >
                    <Edit3 className='w-5 h-5' />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    className='p-2 rounded-lg hover:bg-destructive/10 border border-border hover:border-destructive/30 transition-all text-foreground disabled:opacity-50 disabled:cursor-not-allowed'
                    title='Delete asset'
                  >
                    <Trash2 className='w-5 h-5' />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showEditModal && editingAsset && (
        <AddAssetModal
          asset={editingAsset}
          onClose={() => {
            setShowEditModal(false);
            setEditingAsset(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingAsset(null);
          }}
        />
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className='bg-card p-2 rounded border border-border'>
      <div className='text-xs text-muted-foreground font-medium mb-1'>
        {label}
      </div>
      <div className='text-sm font-bold break-words text-foreground'>
        {value}
      </div>
    </div>
  );
}
