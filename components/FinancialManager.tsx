import React, { useState } from 'react';
import { useFinancialManager } from '../presentation/hooks/useFinancialManager';
import { 
  DollarSign, Plus, Trash2, Loader2, AlertTriangle, Edit2, Save, X, 
  TrendingUp, TrendingDown, Wallet, Tag, Building2, Calendar, 
  CreditCard, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { 
  FinancialTransaction, 
  FinancialCategory, 
  BankAccount, 
  CostCenter,
  FinancialTransactionType,
  FinancialTransactionStatus,
  FinancialCategoryType,
  PaymentMethod
} from '../types';
import ConfirmationModal from './ConfirmationModal';

interface FinancialManagerProps {
  hasSupabase: boolean;
  institutionId: string | null;
}

const FinancialManager: React.FC<FinancialManagerProps> = ({ hasSupabase, institutionId }) => {
  const {
    transactions,
    categories,
    bankAccounts,
    costCenters,
    loading,
    error,
    summary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addCostCenter,
    updateCostCenter,
    deleteCostCenter,
  } = useFinancialManager(hasSupabase, institutionId);

  const [activeTab, setActiveTab] = useState<'transactions' | 'categories' | 'accounts' | 'costCenters'>('transactions');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showCostCenterForm, setShowCostCenterForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: string; id: string; name: string }>({
    isOpen: false,
    type: '',
    id: '',
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'RECEIVABLE' | 'PAYABLE'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | FinancialTransactionStatus>('all');

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState<Partial<FinancialTransaction>>({
    category_id: '',
    bank_account_id: '',
    cost_center_id: '',
    description: '',
    amount: 0,
    due_date: new Date().toISOString().split('T')[0],
    payment_date: '',
    status: 'PENDING',
    type: 'PAYABLE',
    payment_method: undefined,
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState<Partial<FinancialCategory>>({
    name: '',
    type: 'EXPENSE',
    parent_id: undefined,
  });

  // Bank account form state
  const [accountForm, setAccountForm] = useState<Partial<BankAccount>>({
    name: '',
    bank_name: '',
    agency: '',
    account_number: '',
    initial_balance: 0,
  });

  // Cost center form state
  const [costCenterForm, setCostCenterForm] = useState<Partial<CostCenter>>({
    name: '',
    code: '',
  });

  const resetTransactionForm = () => {
    setTransactionForm({
      category_id: '',
      bank_account_id: '',
      cost_center_id: '',
      description: '',
      amount: 0,
      due_date: new Date().toISOString().split('T')[0],
      payment_date: '',
      status: 'PENDING',
      type: 'PAYABLE',
      payment_method: undefined,
    });
    setEditingTransaction(null);
    setShowTransactionForm(false);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', type: 'EXPENSE', parent_id: undefined });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const resetAccountForm = () => {
    setAccountForm({ name: '', bank_name: '', agency: '', account_number: '', initial_balance: 0 });
    setEditingAccount(null);
    setShowAccountForm(false);
  };

  const resetCostCenterForm = () => {
    setCostCenterForm({ name: '', code: '' });
    setEditingCostCenter(null);
    setShowCostCenterForm(false);
  };

  const handleEditTransaction = (transaction: FinancialTransaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      category_id: transaction.category_id,
      bank_account_id: transaction.bank_account_id || '',
      cost_center_id: transaction.cost_center_id || '',
      description: transaction.description,
      amount: transaction.amount,
      due_date: transaction.due_date.split('T')[0],
      payment_date: transaction.payment_date?.split('T')[0] || '',
      status: transaction.status,
      type: transaction.type,
      payment_method: transaction.payment_method,
    });
    setShowTransactionForm(true);
  };

  const handleEditCategory = (category: FinancialCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      type: category.type,
      parent_id: category.parent_id || undefined,
    });
    setShowCategoryForm(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setAccountForm({
      name: account.name,
      bank_name: account.bank_name || '',
      agency: account.agency || '',
      account_number: account.account_number || '',
      initial_balance: account.initial_balance,
    });
    setShowAccountForm(true);
  };

  const handleEditCostCenter = (costCenter: CostCenter) => {
    setEditingCostCenter(costCenter);
    setCostCenterForm({
      name: costCenter.name,
      code: costCenter.code || '',
    });
    setShowCostCenterForm(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionForm.category_id || !transactionForm.description || !transactionForm.amount) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionForm);
      } else {
        await addTransaction(transactionForm);
      }
      resetTransactionForm();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.type) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryForm);
      } else {
        await addCategory(categoryForm);
      }
      resetCategoryForm();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.name) {
      alert('O nome da conta é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAccount) {
        await updateBankAccount(editingAccount.id, accountForm);
      } else {
        await addBankAccount(accountForm);
      }
      resetAccountForm();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar conta bancária');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCostCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!costCenterForm.name) {
      alert('O nome do centro de custo é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCostCenter) {
        await updateCostCenter(editingCostCenter.id, costCenterForm);
      } else {
        await addCostCenter(costCenterForm);
      }
      resetCostCenterForm();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar centro de custo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      switch (deleteModal.type) {
        case 'transaction':
          await deleteTransaction(deleteModal.id);
          break;
        case 'category':
          await deleteCategory(deleteModal.id);
          break;
        case 'account':
          await deleteBankAccount(deleteModal.id);
          break;
        case 'costCenter':
          await deleteCostCenter(deleteModal.id);
          break;
      }
      setDeleteModal({ isOpen: false, type: '', id: '', name: '' });
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const incomeCategories = categories.filter(c => c.type === 'INCOME');
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: FinancialTransactionStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'OVERDUE':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'CANCELLED':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: FinancialTransactionStatus) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle size={14} />;
      case 'PENDING':
        return <Clock size={14} />;
      case 'OVERDUE':
        return <AlertCircle size={14} />;
      case 'CANCELLED':
        return <X size={14} />;
      default:
        return null;
    }
  };

  if (!hasSupabase) {
    return <div className="p-8 text-center text-slate-500">Configure o banco de dados primeiro.</div>;
  }

  if (!institutionId) {
    return <div className="p-8 text-center text-slate-500">Nenhuma instituição selecionada.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Receitas</span>
            <TrendingUp className="text-emerald-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.income)}</div>
          <div className="text-xs text-slate-500 mt-1">Pendente: {formatCurrency(summary.pendingIncome)}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Despesas</span>
            <TrendingDown className="text-red-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.expenses)}</div>
          <div className="text-xs text-slate-500 mt-1">Pendente: {formatCurrency(summary.pendingExpenses)}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Saldo</span>
            <DollarSign className={summary.balance >= 0 ? 'text-emerald-600' : 'text-red-600'} size={20} />
          </div>
          <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(summary.balance)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Receitas - Despesas</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Saldo Bancário</span>
            <Wallet className="text-indigo-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{formatCurrency(summary.totalBankBalance)}</div>
          <div className="text-xs text-slate-500 mt-1">Total em contas</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-2 p-4">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === 'transactions'
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Transações
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === 'categories'
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Categorias
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === 'accounts'
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Contas Bancárias
            </button>
            <button
              onClick={() => setActiveTab('costCenters')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === 'costCenters'
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Centros de Custo
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
            </div>
          ) : (
            <>
              {/* Transactions Tab */}
              {activeTab === 'transactions' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                      >
                        <option value="all">Todos os Tipos</option>
                        <option value="RECEIVABLE">Receitas</option>
                        <option value="PAYABLE">Despesas</option>
                      </select>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                      >
                        <option value="all">Todos os Status</option>
                        <option value="PENDING">Pendente</option>
                        <option value="PAID">Pago</option>
                        <option value="OVERDUE">Vencido</option>
                        <option value="CANCELLED">Cancelado</option>
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        resetTransactionForm();
                        setShowTransactionForm(true);
                      }}
                      className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <Plus size={18} /> Nova Transação
                    </button>
                  </div>

                  {showTransactionForm && (
                    <form onSubmit={handleSaveTransaction} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 space-y-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">
                          {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
                        </h3>
                        <button type="button" onClick={resetTransactionForm} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                          <X size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Tipo *</label>
                          <select
                            value={transactionForm.type}
                            onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as FinancialTransactionType })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                            required
                          >
                            <option value="PAYABLE">Despesa</option>
                            <option value="RECEIVABLE">Receita</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Categoria *</label>
                          <select
                            value={transactionForm.category_id}
                            onChange={(e) => setTransactionForm({ ...transactionForm, category_id: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                            required
                          >
                            <option value="">Selecione...</option>
                            {(transactionForm.type === 'RECEIVABLE' ? incomeCategories : expenseCategories).map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Descrição *</label>
                          <input
                            type="text"
                            value={transactionForm.description}
                            onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Valor *</label>
                          <input
                            type="number"
                            step="0.01"
                            value={transactionForm.amount}
                            onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) || 0 })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Data de Vencimento *</label>
                          <input
                            type="date"
                            value={transactionForm.due_date}
                            onChange={(e) => setTransactionForm({ ...transactionForm, due_date: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Data de Pagamento</label>
                          <input
                            type="date"
                            value={transactionForm.payment_date}
                            onChange={(e) => setTransactionForm({ ...transactionForm, payment_date: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Status *</label>
                          <select
                            value={transactionForm.status}
                            onChange={(e) => setTransactionForm({ ...transactionForm, status: e.target.value as FinancialTransactionStatus })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                            required
                          >
                            <option value="PENDING">Pendente</option>
                            <option value="PAID">Pago</option>
                            <option value="OVERDUE">Vencido</option>
                            <option value="CANCELLED">Cancelado</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Forma de Pagamento</label>
                          <select
                            value={transactionForm.payment_method || ''}
                            onChange={(e) => setTransactionForm({ ...transactionForm, payment_method: e.target.value as PaymentMethod || undefined })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                          >
                            <option value="">Selecione...</option>
                            <option value="CASH">Dinheiro</option>
                            <option value="CREDIT_CARD">Cartão de Crédito</option>
                            <option value="BOLETO">Boleto</option>
                            <option value="PIX">PIX</option>
                            <option value="TRANSFER">Transferência</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Conta Bancária</label>
                          <select
                            value={transactionForm.bank_account_id || ''}
                            onChange={(e) => setTransactionForm({ ...transactionForm, bank_account_id: e.target.value || undefined })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                          >
                            <option value="">Selecione...</option>
                            {bankAccounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Centro de Custo</label>
                          <select
                            value={transactionForm.cost_center_id || ''}
                            onChange={(e) => setTransactionForm({ ...transactionForm, cost_center_id: e.target.value || undefined })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                          >
                            <option value="">Selecione...</option>
                            {costCenters.map(cc => (
                              <option key={cc.id} value={cc.id}>{cc.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={resetTransactionForm}
                          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin inline" size={18} /> : <Save size={18} className="inline" />} Salvar
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3 text-sm font-semibold">Data</th>
                          <th className="p-3 text-sm font-semibold">Descrição</th>
                          <th className="p-3 text-sm font-semibold">Categoria</th>
                          <th className="p-3 text-sm font-semibold">Tipo</th>
                          <th className="p-3 text-sm font-semibold">Valor</th>
                          <th className="p-3 text-sm font-semibold">Status</th>
                          <th className="p-3 text-sm font-semibold text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                              Nenhuma transação encontrada
                            </td>
                          </tr>
                        ) : (
                          filteredTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                              <td className="p-3 text-sm">{new Date(transaction.due_date).toLocaleDateString('pt-BR')}</td>
                              <td className="p-3 text-sm font-medium">{transaction.description}</td>
                              <td className="p-3 text-sm">{transaction.financial_categories?.name || '-'}</td>
                              <td className="p-3 text-sm">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  transaction.type === 'RECEIVABLE' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                }`}>
                                  {transaction.type === 'RECEIVABLE' ? 'Receita' : 'Despesa'}
                                </span>
                              </td>
                              <td className={`p-3 text-sm font-semibold ${
                                transaction.type === 'RECEIVABLE' ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'RECEIVABLE' ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </td>
                              <td className="p-3 text-sm">
                                <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(transaction.status)}`}>
                                  {getStatusIcon(transaction.status)}
                                  {transaction.status === 'PAID' ? 'Pago' : 
                                   transaction.status === 'PENDING' ? 'Pendente' :
                                   transaction.status === 'OVERDUE' ? 'Vencido' : 'Cancelado'}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleEditTransaction(transaction)}
                                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteModal({ isOpen: true, type: 'transaction', id: transaction.id, name: transaction.description })}
                                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        resetCategoryForm();
                        setShowCategoryForm(true);
                      }}
                      className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <Plus size={18} /> Nova Categoria
                    </button>
                  </div>

                  {showCategoryForm && (
                    <form onSubmit={handleSaveCategory} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 space-y-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">
                          {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                        </h3>
                        <button type="button" onClick={resetCategoryForm} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                          <X size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Nome *</label>
                          <input
                            type="text"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Tipo *</label>
                          <select
                            value={categoryForm.type}
                            onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as FinancialCategoryType })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                            required
                          >
                            <option value="EXPENSE">Despesa</option>
                            <option value="INCOME">Receita</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Categoria Pai</label>
                          <select
                            value={categoryForm.parent_id || ''}
                            onChange={(e) => setCategoryForm({ ...categoryForm, parent_id: e.target.value || undefined })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                          >
                            <option value="">Nenhuma (categoria principal)</option>
                            {categories
                              .filter(c => c.type === categoryForm.type && c.id !== editingCategory?.id)
                              .map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={resetCategoryForm}
                          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin inline" size={18} /> : <Save size={18} className="inline" />} Salvar
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-emerald-700 flex items-center gap-2">
                        <TrendingUp size={18} /> Receitas
                      </h4>
                      <div className="space-y-2">
                        {incomeCategories.length === 0 ? (
                          <p className="text-sm text-slate-500 dark:text-slate-400 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">Nenhuma categoria de receita</p>
                        ) : (
                          incomeCategories.map((category) => (
                            <div key={category.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex justify-between items-center">
                              <div>
                                <div className="font-semibold">{category.name}</div>
                                {category.parent_id && (
                                  <div className="text-xs text-slate-500">Subcategoria</div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditCategory(category)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => setDeleteModal({ isOpen: true, type: 'category', id: category.id, name: category.name })}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-red-700 flex items-center gap-2">
                        <TrendingDown size={18} /> Despesas
                      </h4>
                      <div className="space-y-2">
                        {expenseCategories.length === 0 ? (
                          <p className="text-sm text-slate-500 dark:text-slate-400 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">Nenhuma categoria de despesa</p>
                        ) : (
                          expenseCategories.map((category) => (
                            <div key={category.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex justify-between items-center">
                              <div>
                                <div className="font-semibold">{category.name}</div>
                                {category.parent_id && (
                                  <div className="text-xs text-slate-500">Subcategoria</div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditCategory(category)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => setDeleteModal({ isOpen: true, type: 'category', id: category.id, name: category.name })}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Accounts Tab */}
              {activeTab === 'accounts' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        resetAccountForm();
                        setShowAccountForm(true);
                      }}
                      className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <Plus size={18} /> Nova Conta
                    </button>
                  </div>

                  {showAccountForm && (
                    <form onSubmit={handleSaveAccount} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 space-y-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">
                          {editingAccount ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
                        </h3>
                        <button type="button" onClick={resetAccountForm} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                          <X size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Nome *</label>
                          <input
                            type="text"
                            value={accountForm.name}
                            onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Banco</label>
                          <input
                            type="text"
                            value={accountForm.bank_name}
                            onChange={(e) => setAccountForm({ ...accountForm, bank_name: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Agência</label>
                          <input
                            type="text"
                            value={accountForm.agency}
                            onChange={(e) => setAccountForm({ ...accountForm, agency: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Número da Conta</label>
                          <input
                            type="text"
                            value={accountForm.account_number}
                            onChange={(e) => setAccountForm({ ...accountForm, account_number: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Saldo Inicial</label>
                          <input
                            type="number"
                            step="0.01"
                            value={accountForm.initial_balance}
                            onChange={(e) => setAccountForm({ ...accountForm, initial_balance: parseFloat(e.target.value) || 0 })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={resetAccountForm}
                          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin inline" size={18} /> : <Save size={18} className="inline" />} Salvar
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bankAccounts.length === 0 ? (
                      <div className="col-span-full p-8 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        Nenhuma conta bancária cadastrada
                      </div>
                    ) : (
                      bankAccounts.map((account) => (
                        <div key={account.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-semibold text-lg">{account.name}</div>
                              {account.bank_name && (
                                <div className="text-sm text-slate-500">{account.bank_name}</div>
                              )}
                              {account.agency && account.account_number && (
                                <div className="text-xs text-slate-400">
                                  Ag: {account.agency} - CC: {account.account_number}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditAccount(account)}
                                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteModal({ isOpen: true, type: 'account', id: account.id, name: account.name })}
                                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="text-sm text-slate-600 dark:text-slate-400">Saldo Atual</div>
                            <div className={`text-xl font-bold ${account.current_balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {formatCurrency(account.current_balance)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Cost Centers Tab */}
              {activeTab === 'costCenters' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        resetCostCenterForm();
                        setShowCostCenterForm(true);
                      }}
                      className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <Plus size={18} /> Novo Centro de Custo
                    </button>
                  </div>

                  {showCostCenterForm && (
                    <form onSubmit={handleSaveCostCenter} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 space-y-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">
                          {editingCostCenter ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
                        </h3>
                        <button type="button" onClick={resetCostCenterForm} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                          <X size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Nome *</label>
                          <input
                            type="text"
                            value={costCenterForm.name}
                            onChange={(e) => setCostCenterForm({ ...costCenterForm, name: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-200">Código</label>
                          <input
                            type="text"
                            value={costCenterForm.code}
                            onChange={(e) => setCostCenterForm({ ...costCenterForm, code: e.target.value })}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={resetCostCenterForm}
                          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin inline" size={18} /> : <Save size={18} className="inline" />} Salvar
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {costCenters.length === 0 ? (
                      <div className="col-span-full p-8 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        Nenhum centro de custo cadastrado
                      </div>
                    ) : (
                      costCenters.map((costCenter) => (
                        <div key={costCenter.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <div className="font-semibold">{costCenter.name}</div>
                            {costCenter.code && (
                              <div className="text-sm text-slate-500">Código: {costCenter.code}</div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCostCenter(costCenter)}
                              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, type: 'costCenter', id: costCenter.id, name: costCenter.name })}
                              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: '', id: '', name: '' })}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir "${deleteModal.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default FinancialManager;
