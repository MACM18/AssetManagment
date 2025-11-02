"use client";

import { useState, useMemo } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { deleteAsset, computeAssetMetrics } from "@/lib/portfolio";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2 } from "lucide-react";

export default function AssetsList() {
  const { assets, assetsSummary, refreshPortfolio } = usePortfolio();
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  return (
    <div className='rounded-lg shadow-lg border'>
      <div className='p-6 border-b'>
        <h2 className='text-xl font-bold'>Other Assets</h2>
        {assetsSummary && (
          <p className='text-sm mt-1'>
            Total Value: LKR{" "}
            {assetsSummary.totalCurrentValue.toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        )}
      </div>

      {rows.length === 0 ? (
        <div className='p-6 text-center text-sm'>No assets added yet</div>
      ) : (
        <div className='divide-y'>
          {rows.map((a) => (
            <div key={a.id} className='p-6'>
              <div className='flex justify-between items-start gap-4'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs px-2 py-0.5 border rounded-full capitalize'>
                      {a.type.replace("-", " ")}
                    </span>
                    <h3 className='text-lg font-bold truncate'>{a.name}</h3>
                  </div>
                  {a.notes && (
                    <p className='text-sm mt-1 text-muted-foreground truncate'>
                      {a.notes}
                    </p>
                  )}
                </div>
                <div className='text-right'>
                  <div className='text-xs'>Current Value</div>
                  <div className='font-semibold'>
                    LKR{" "}
                    {a.currentValue.toLocaleString("en-LK", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>

              {/* details */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-3'>
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

              <div className='flex justify-end pt-3'>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deletingId === a.id}
                  className='p-2 underline disabled:opacity-50'
                >
                  <Trash2 className='w-5 h-5' />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className='text-xs text-muted-foreground'>{label}</div>
      <div className='text-sm font-medium break-words'>{value}</div>
    </div>
  );
}
