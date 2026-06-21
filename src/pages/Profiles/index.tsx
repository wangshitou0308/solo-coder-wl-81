import { useState } from 'react';
import { Users, UserPlus, Pencil, Trash2, CheckCircle2, X, ArrowRightLeft } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { UserProfile } from '@/types';
import { formatDate } from '@/utils/dateUtils';

const RELATION_OPTIONS = [
  { value: '本人', label: '本人' },
  { value: '配偶', label: '配偶' },
  { value: '子女', label: '子女' },
  { value: '父母', label: '父母' },
  { value: '其他', label: '其他' },
];

export default function Profiles() {
  const { profiles, activeProfileId, addProfile, updateProfile, deleteProfile, switchProfile } = useProfileStore();
  const { currentProfileId, updateSettings } = useSettingsStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState('');
  const [addRelation, setAddRelation] = useState('本人');

  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editRelation, setEditRelation] = useState('');

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const handleAdd = () => {
    if (!addName.trim()) return;
    addProfile({ name: addName.trim(), relation: addRelation });
    setAddName('');
    setAddRelation('本人');
    setShowAddForm(false);
  };

  const handleSwitch = (id: string) => {
    switchProfile(id);
    updateSettings({ currentProfileId: id });
  };

  const startEdit = (profile: UserProfile) => {
    setEditingProfile(profile);
    setEditName(profile.name);
    setEditRelation(profile.relation);
  };

  const handleEditSave = () => {
    if (!editingProfile || !editName.trim()) return;
    updateProfile(editingProfile.id, { name: editName.trim(), relation: editRelation });
    setEditingProfile(null);
    setEditName('');
    setEditRelation('');
  };

  const handleEditCancel = () => {
    setEditingProfile(null);
    setEditName('');
    setEditRelation('');
  };

  const handleDelete = (id: string) => {
    if (profiles.length <= 1) return;
    deleteProfile(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-gradient-primary text-white shadow-md">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold text-primary-800">用户档案</h1>
          <p className="text-sm text-primary-500">管理多用户档案，独立追踪每位成员的视力数据</p>
        </div>
      </div>

      {activeProfile && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-lg">
                {activeProfile.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-semibold text-primary-800">{activeProfile.name}</h2>
                  <Badge variant="accent">{activeProfile.relation}</Badge>
                </div>
                <p className="text-xs text-primary-400 mt-0.5">当前活跃档案</p>
              </div>
            </div>
            <Badge variant="success">活跃</Badge>
          </div>
        </Card>
      )}

      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
        <p className="text-sm text-blue-700">
          切换档案后，所有数据将切换到对应档案
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          <h3 className="font-serif text-lg font-semibold text-primary-800">档案列表</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-600">
            {profiles.length}
          </span>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary">
          <UserPlus className="w-4 h-4" />
          新建档案
        </button>
      </div>

      {showAddForm && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-primary-600" />
            <h4 className="font-serif text-base font-semibold text-primary-800">新建档案</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">姓名</label>
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="例如：妈妈、孩子"
                className="w-full px-4 py-2.5 rounded-xl border border-primary-200 bg-white text-primary-800 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">关系</label>
              <select
                value={addRelation}
                onChange={(e) => setAddRelation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-primary-200 bg-white text-primary-800 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all"
              >
                {RELATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleAdd} className="btn-primary">
                <CheckCircle2 className="w-4 h-4" />
                保存
              </button>
              <button onClick={() => { setShowAddForm(false); setAddName(''); setAddRelation('本人'); }} className="px-4 py-2 rounded-xl bg-primary-100 text-primary-600 text-sm font-medium hover:bg-primary-200 transition-all">
                取消
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfileId;
          return (
            <Card key={profile.id} className={`p-5 ${isActive ? 'ring-2 ring-accent-400 border-accent-300' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-base ${
                    isActive ? 'bg-gradient-primary text-white' : 'bg-primary-100 text-primary-600'
                  }`}>
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-primary-800">{profile.name}</h4>
                      <Badge variant={isActive ? 'accent' : 'default'}>{profile.relation}</Badge>
                      {isActive && <Badge variant="success">当前</Badge>}
                    </div>
                    <p className="text-xs text-primary-400 mt-0.5">
                      创建于 {formatDate(profile.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-primary-100">
                {!isActive && (
                  <button onClick={() => handleSwitch(profile.id)} className="px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:opacity-90 transition-all flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    切换到该档案
                  </button>
                )}
                <button onClick={() => startEdit(profile)} className="btn-secondary text-sm">
                  <Pencil className="w-3.5 h-3.5" />
                  编辑
                </button>
                {profiles.length > 1 && (
                  <button onClick={() => handleDelete(profile.id)} className="px-4 py-2 rounded-xl bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleEditCancel}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-lg font-semibold text-primary-800">编辑档案</h3>
              <button onClick={handleEditCancel} className="p-1.5 rounded-lg hover:bg-primary-100 text-primary-400 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-primary-200 bg-white text-primary-800 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">关系</label>
                <select
                  value={editRelation}
                  onChange={(e) => setEditRelation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-primary-200 bg-white text-primary-800 text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none transition-all"
                >
                  {RELATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button onClick={handleEditSave} className="btn-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  保存
                </button>
                <button onClick={handleEditCancel} className="px-4 py-2 rounded-xl bg-primary-100 text-primary-600 text-sm font-medium hover:bg-primary-200 transition-all">
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
