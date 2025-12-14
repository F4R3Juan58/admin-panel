import React from 'react';
import { createNuiApi, newRequestId, ActionType, ActionRequestPayloads } from '@api';
import {
  AppLayout,
  Sidebar,
  Topbar,
  Card,
  StatWidget,
  SectionTitle,
  ActionGrid,
  Table,
  Badge,
  Button,
  Modal,
  ToastStack,
  Tabs,
  FormGroup,
  Input,
  Textarea,
  ChatList,
  LogList,
  MetricRow,
  VirtualList,
  PageGrid,
} from '@ui';
import { BanEntry, ChatMessage, PlayerSummary, AdminAction } from '@types';

const api = createNuiApi('nui');

type Toast = { id: string; message: string; tone?: 'success' | 'error' | 'info' };
type ViewKey = 'actions' | 'players' | 'stats' | 'bans' | 'chat' | 'logs';

const useAsync = <T,>(fn: () => Promise<T>, deps: React.DependencyList) => {
  const [data, setData] = React.useState<T | null>(null);

  React.useEffect(() => {
    fn().then(setData).catch(console.error);
  }, deps);

  return { data, refetch: () => fn().then(setData) } as const;
};

const App: React.FC = () => {
  const [view, setView] = React.useState<ViewKey>('actions');
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [search, setSearch] = React.useState('');

  const { data: players = [] } = useAsync(() => api.getPlayersLive(), []);
  const { data: bans = [], refetch: refetchBans } = useAsync(() => api.getBans(), []);
  const { data: stats = { players: 0, bankTotal: 0, cashTotal: 0, actionsTotal: 0 } } = useAsync(() => api.getServerStats(), []);
  const { data: logs = [] } = useAsync(() => api.getLogs(), []);
  const { data: chat = [], refetch: refetchChat } = useAsync(() => api.getChatMessages(), []);

  const pushToast = (message: string, tone: Toast['tone'] = 'info') => setToasts((t) => [...t, { id: crypto.randomUUID(), message, tone }]);

  const executeAction = async (actionType: ActionType, payload: ActionRequestPayloads[ActionType]) => {
    pushToast('Acción encolada', 'info');
    try {
      await api.executeAction({ actionType, payload, requestId: newRequestId(), source: 'NUI' });
      pushToast('Acción enviada al worker', 'success');
    } catch (err) {
      console.error(err);
      pushToast('Error al enviar acción', 'error');
    }
  };

  const unban = async (banId: number) => {
    await executeAction(ActionType.UNBAN, { banId });
    refetchBans();
  };

  const sendChat = async (message: string) => {
    if (!message) return;
    await api.postChatMessage(message);
    refetchChat();
    pushToast('Mensaje enviado', 'success');
  };

  const filteredPlayers = players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.citizenId.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search));

  const sidebarLinks = [
    { key: 'actions', label: 'Acciones', icon: '⚡' },
    { key: 'players', label: 'Jugadores', icon: '👥' },
    { key: 'stats', label: 'Estadísticas', icon: '📊' },
    { key: 'bans', label: 'Baneos', icon: '⛔' },
    { key: 'chat', label: 'Chat', icon: '💬' },
    { key: 'logs', label: 'Logs', icon: '📜' },
  ];

  return (
    <AppLayout
      sidebar={<Sidebar links={sidebarLinks} active={view} onNavigate={(key) => setView(key as ViewKey)} />}
      topbar={<Topbar placeholder="Buscar jugadores" onSearch={setSearch} actions={<Tabs tabs={sidebarLinks.map(({ key, label }) => ({ key, label }))} active={view} onChange={(k) => setView(k as ViewKey)} />} />}
    >
      {view === 'actions' && (
        <>
          <SectionTitle title="Acciones rápidas" description="UI compartida con panel web" />
          <ActionGrid
            actions={[
              { key: 'noclip', title: 'Noclip', description: 'Moverse libremente', onClick: () => executeAction(ActionType.NOCLIP, { enabled: true }) },
              { key: 'god', title: 'Modo Dios', description: 'Invulnerable', onClick: () => executeAction(ActionType.GODMODE_SELF, { enabled: true }) },
              { key: 'announce', title: 'Anunciar', description: 'Mensaje global', onClick: () => executeAction(ActionType.ANNOUNCE, { message: 'Mensaje rápido' }) },
              { key: 'reviveall', title: 'Revivir a todos', description: 'Acción global', onClick: () => executeAction(ActionType.REVIVE_ALL, {}), dangerous: true },
              { key: 'clear', title: 'Limpiar entidades', description: 'Limpia cercano', onClick: () => executeAction(ActionType.CLEAR_NEARBY, { radius: 25 }), dangerous: true },
            ]}
          />
        </>
      )}

      {view === 'players' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card title="Jugadores en vivo" className="xl:col-span-2">
            <VirtualList
              items={filteredPlayers}
              itemHeight={70}
              height={520}
              render={(player) => (
                <div className="flex items-center justify-between py-3 px-3 border-b border-slate-800">
                  <div>
                    <p className="font-semibold text-slate-100">{player.name}</p>
                    <p className="text-xs text-slate-500">{player.citizenId} · {player.job}</p>
                  </div>
                  <Badge label={`Ping ${player.ping ?? 0}`} color="yellow" />
                </div>
              )}
            />
          </Card>
          <Card title="Acciones frecuentes">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => executeAction(ActionType.REVIVE, { targetId: filteredPlayers[0]?.id ?? '' })}>Revivir</Button>
              <Button onClick={() => executeAction(ActionType.HEAL, { targetId: filteredPlayers[0]?.id ?? '' })}>Curar</Button>
              <Button variant="danger" onClick={() => executeAction(ActionType.KILL, { targetId: filteredPlayers[0]?.id ?? '' })}>
                Matar
              </Button>
              <Button onClick={() => executeAction(ActionType.BAN, { targetId: filteredPlayers[0]?.id ?? '', reason: 'Razón', expiresAt: null })}>
                Banear
              </Button>
            </div>
          </Card>
        </div>
      )}

      {view === 'stats' && (
        <PageGrid>
          <div className="xl:col-span-2 space-y-4">
            <SectionTitle title="KPIs" description="Métricas rápidas" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatWidget label="Jugadores" value={stats.players} />
              <StatWidget label="Banco total" value={`$${stats.bankTotal.toLocaleString()}`} />
              <StatWidget label="Efectivo total" value={`$${stats.cashTotal.toLocaleString()}`} />
              <StatWidget label="Acciones" value={stats.actionsTotal} />
            </div>
            <Card title="Salud del servidor">
              <MetricRow label="RAM" value={`${stats.ramUsageMb ?? 'N/A'} MB`} />
              <MetricRow label="CPU" value={`${stats.cpuUsage ?? 'N/A'} %`} />
            </Card>
          </div>
          <Card title="Notas NUI">
            <p className="text-sm text-slate-400">Panel NUI usa el mismo design system y endpoints NUI callbacks hacia el backend.</p>
          </Card>
        </PageGrid>
      )}

      {view === 'bans' && <Card title="Baneos"><Table columns={['ID', 'Jugador', 'Razón', 'Staff', 'Estado', 'Acciones']} rows={bans.map((ban) => [ban.id, ban.citizenId ?? ban.identifier ?? 'N/A', ban.reason, ban.bannedBy, <Badge key={`b-${ban.id}`} label={ban.active ? 'Activo' : 'Inactivo'} color={ban.active ? 'red' : 'default'} />, (
        <Button key={`u-${ban.id}`} size="sm" variant="ghost" onClick={() => unban(ban.id)}>
          Unban
        </Button>
      )])} /></Card>}

      {view === 'chat' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card title="Chat de administradores" className="xl:col-span-2">
            <ChatList messages={chat as ChatMessage[]} />
          </Card>
          <Card title="Enviar mensaje">
            <FormGroup label="Mensaje">
              <Textarea rows={5} placeholder="Mensaje" onChange={(e) => setSearch(e.target.value)} value={search} />
            </FormGroup>
            <Button className="mt-3" onClick={() => { sendChat(search); setSearch(''); }}>
              Enviar
            </Button>
          </Card>
        </div>
      )}

      {view === 'logs' && (
        <Card title="Logs de acciones">
          <LogList logs={(logs as AdminAction[]).map((l) => ({ id: l.id, actionType: l.actionType, actorName: l.actorName, status: l.status, createdAt: l.createdAt }))} />
        </Card>
      )}

      <ToastStack toasts={toasts} />
      <Modal
        title="Confirmar acción peligrosa"
        open={false}
        onClose={() => null}
        onConfirm={() => null}
      >
        Placeholder
      </Modal>
    </AppLayout>
  );
};

export default App;
