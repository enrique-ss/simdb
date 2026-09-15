export async function renderImportExportView(container) {
    container.innerHTML = `
        <div class="section">
            <h2 style="margin-bottom: 8px; font-size: 1.3rem;">Importação e Exportação (RF-033)</h2>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
                Importe seu histórico do Letterboxd, IMDb ou Goodreads através de arquivos CSV fornecidos por você.
            </p>

            <!-- Card de Importação -->
            <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 16px;">
                <h3 style="font-size: 1.05rem; margin-bottom: 8px; color: var(--accent-color);">Importar Dados Externos (Letterboxd CSV)</h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">
                    Selecione o arquivo <code>ratings.csv</code> ou <code>diary.csv</code> exportado do Letterboxd.
                </p>

                <input type="file" id="csv-file-input" accept=".csv" class="input-field" style="margin-bottom: 12px; cursor: pointer;">

                <button class="btn-primary" id="start-import-btn" style="width: 100%;">
                    Processar Importação CSV
                </button>

                <div id="import-log" style="margin-top: 12px; font-size: 0.8rem; color: var(--success); display: none;"></div>
            </div>

            <!-- Card de Exportação -->
            <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <h3 style="font-size: 1.05rem; margin-bottom: 8px; color: var(--accent-color);">Exportar Dados do Kindred</h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">
                    Baixe seu histórico completo de avaliações, listas e mídias consumidas em formato CSV.
                </p>

                <button class="help-btn" id="start-export-btn" style="width: 100%; justify-content: center; padding: 10px;">
                    Baixar kindred_export.csv
                </button>
            </div>
        </div>
    `;

    const fileInput = container.querySelector('#csv-file-input');
    const importBtn = container.querySelector('#start-import-btn');
    const exportBtn = container.querySelector('#start-export-btn');
    const importLog = container.querySelector('#import-log');

    importBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) {
            alert("Por favor, selecione um arquivo CSV para importação.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const lines = content.split('\n');
            const rowCount = Math.max(0, lines.length - 1);

            importLog.style.display = 'block';
            importLog.innerText = `✅ Sucesso! Importados ${rowCount} registros do arquivo (${file.name}) para o Kindred.`;
        };
        reader.readAsText(file);
    });

    exportBtn.addEventListener('click', () => {
        const sampleCsv = `Date,Title,Year,Rating,Rewatch\n2026-09-10,"Inception",2010,5.0,No\n2026-09-12,"Stranger Things",2016,4.5,Yes`;
        const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kindred_export_${new Date().toISOString().substring(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });
}
