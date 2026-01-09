'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseAndValidateImport, commitImport, ImportPreviewRow } from '@/app/actions/import-contributions';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import * as XLSX from 'xlsx';

interface ExcelImportModalProps {
    groupId: string;
}

export function ExcelImportModal({ groupId }: ExcelImportModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [previewData, setPreviewData] = useState<ImportPreviewRow[]>([]);
    const [summary, setSummary] = useState<{ total: number; valid: number; errors: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            { Email: 'user@example.com', Amount: 5000, Date: '2024-01-01' },
            { Email: 'another@example.com', Amount: 5000, Date: '2024-02-01' },
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'contribution_import_template.xlsx');
    };

    const handleParse = async () => {
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        const result = await parseAndValidateImport(formData, groupId);
        setIsLoading(false);

        if (result.success && result.preview) {
            setPreviewData(result.preview);
            setSummary(result.summary || null);
            setStep('preview');
        } else {
            toast.error(result.error || 'Failed to parse file');
        }
    };

    const handleCommit = async () => {
        if (!previewData.length) return;

        setIsLoading(true);
        const result = await commitImport(previewData, groupId);
        setIsLoading(false);

        if (result.success) {
            toast.success(`Successfully imported ${result.count} records`);
            setIsOpen(false);
            resetState();
        } else {
            toast.error(result.error || 'Failed to import records');
        }
    };

    const resetState = () => {
        setFile(null);
        setStep('upload');
        setPreviewData([]);
        setSummary(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Import Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Import Historical Contributions</DialogTitle>
                    <DialogDescription>
                        Upload an Excel file to bulk import past contributions.
                    </DialogDescription>
                </DialogHeader>

                {step === 'upload' ? (
                    <div className="space-y-6 py-4">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-10 hover:bg-muted/50 transition-colors">
                            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                            <div className="text-center space-y-2">
                                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground">XLSX or CSV files only</p>
                            </div>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.csv" // Limit accepted files
                                className="hidden" // Hidden input, controlled by button or parent div click (if implemented)
                                onChange={handleFileChange}
                                id="file-upload" // Add ID for Label
                            />
                            <Button variant="secondary" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                                Select File
                            </Button>
                            {file && (
                                <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    {file.name}
                                </div>
                            )}
                        </div>

                        <div className="bg-muted/30 p-4 rounded-md space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold">Template Format</h4>
                                <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs" onClick={downloadTemplate}>
                                    <Download className="h-3.5 w-3.5" />
                                    Download Template
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Your Excel file must include these headers:
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-background p-2 rounded border">
                                <div>Email</div>
                                <div>Amount</div>
                                <div>Date (YYYY-MM-DD)</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {summary && (
                            <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">{summary.valid} Valid</span>
                                </div>
                                <div className="flex items-center gap-2 text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">{summary.errors} Errors</span>
                                </div>
                            </div>
                        )}

                        <div className="border rounded-md overflow-hidden max-h-[300px] relative">
                            <div className="overflow-auto max-h-[300px]">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                        <TableRow>
                                            <TableHead className="w-[80px]">Row</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.slice(0, 50).map((row) => (
                                            <TableRow key={row.rowNumber} className={row.status === 'ERROR' ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                                                <TableCell className="font-mono text-xs text-muted-foreground">{row.rowNumber}</TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={row.email}>{row.email}</TableCell>
                                                <TableCell className="max-w-[150px] truncate">{row.userName || '-'}</TableCell>
                                                <TableCell>{row.amount.toLocaleString()}</TableCell>
                                                <TableCell>{row.date || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    {row.status === 'VALID' ? (
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-700/30 dark:text-green-400">
                                                            Valid
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-700/30 dark:text-red-400" title={row.error}>
                                                            Error
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {step === 'upload' ? (
                        <Button onClick={handleParse} disabled={!file || isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Parse & Preview
                        </Button>
                    ) : (
                        <div className="flex gap-2 w-full justify-end">
                            <Button variant="outline" onClick={() => setStep('upload')} disabled={isLoading}>
                                Back
                            </Button>
                            <Button onClick={handleCommit} disabled={summary?.valid === 0 || isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Import {summary?.valid} Records
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
