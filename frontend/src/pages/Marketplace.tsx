import { useEffect, useState } from 'react';
import { Plus, MapPin, Phone, Package, Trash2, HandHeart } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, CardBody, Input, Select, Modal, Badge, Spinner, EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { SSP, formatNumber, timeAgo } from '@/lib/utils';

interface Listing {
  id: number;
  buyer_name: string;
  commodity: string;
  quantity: number;
  unit: string;
  price: number;
  delivery_location: string;
  contact_info: string;
  status: string;
  created_at: string;
  interests: number;
}

const COMMODITIES = ['Maize', 'Sorghum', 'Groundnuts', 'Sesame', 'Cassava'];

export default function Marketplace() {
  const { user } = useAuth();
  const canPost = user?.role === 'buyer' || user?.role === 'super_admin';
  const [rows, setRows] = useState<Listing[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ commodity: 'Maize', quantity: '', price: '', delivery_location: '', contact_info: '' });

  const load = () => {
    setLoading(true);
    api
      .get<Listing[]>(`/marketplace${filter ? `?commodity=${filter}` : ''}`)
      .then(setRows)
      .finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const save = async () => {
    await api.post('/marketplace', form);
    setOpen(false);
    setForm({ commodity: 'Maize', quantity: '', price: '', delivery_location: '', contact_info: '' });
    load();
  };

  const expressInterest = async (id: number) => {
    await api.post(`/marketplace/${id}/interest`, {});
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Remove this listing?')) return;
    await api.del(`/marketplace/${id}`);
    load();
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Buyer Marketplace"
        subtitle="Buying opportunities connecting buyers with farmers"
        actions={
          canPost && (
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Post Demand
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('')}
          className={`rounded-xl border px-4 py-2 text-sm font-medium ${!filter ? 'border-forest bg-forest text-white' : 'border-slate-200 bg-white text-slate-600'}`}
        >
          All
        </button>
        {COMMODITIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium ${filter === c ? 'border-forest bg-forest text-white' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-7 w-7" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState title="No listings yet" hint="Buyers can post buying opportunities here." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((l) => (
            <Card key={l.id} className="flex flex-col transition hover:shadow-card">
              <CardBody className="flex flex-1 flex-col pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Package size={20} />
                  </div>
                  <Badge tone={l.status === 'open' ? 'green' : 'gray'}>{l.status}</Badge>
                </div>
                <h3 className="text-lg font-bold text-ink">{l.commodity}</h3>
                <p className="text-sm text-slate-500">{l.buyer_name}</p>

                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity</span>
                    <span className="font-medium text-ink">{formatNumber(l.quantity)} {l.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Offer Price</span>
                    <span className="font-semibold text-forest">{SSP(l.price)}/{l.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={13} className="text-forest" /> {l.delivery_location}
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Phone size={13} /> {l.contact_info}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">{l.interests} interested · {timeAgo(l.created_at)}</span>
                  {canPost ? (
                    <button onClick={() => remove(l.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => expressInterest(l.id)}>
                      <HandHeart size={14} /> Submit Interest
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Post Buying Opportunity">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Commodity" value={form.commodity} onChange={(e) => setForm({ ...form, commodity: e.target.value })}>
              {COMMODITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Input label="Quantity (kg)" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Offer Price (SSP/kg)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input label="Delivery Location" value={form.delivery_location} onChange={(e) => setForm({ ...form, delivery_location: e.target.value })} />
          </div>
          <Input label="Contact Information" value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} placeholder="+211 ..." />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Post Demand</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
