package service

import (
	"encoding/json"
	"fmt"

	"github.com/AZEINMU1911/simae-tb/internal/repository"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
)

type ExportService struct {
	repo *repository.ScreeningRepository
}

func NewExportService(db *gorm.DB) *ExportService {
	return &ExportService{
		repo: repository.NewScreeningRepository(db),
	}
}

func (s *ExportService) ExportScreenings(result string, from string, to string) (*excelize.File, error) {
	screenings, _, err := s.repo.ListAll(result, from, to, 1, 99999)
	if err != nil {
		return nil, err
	}

	f := excelize.NewFile()
	sheet := "Skrining TB"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{
		"Tanggal Isi", "Nama", "No HP",
		"Batuk ≥ 2 Minggu", "Demam Hilang Timbul", "Keringat Malam",
		"Berat Badan Turun", "Nafsu Makan Turun/Lemas", "Sesak Napas",
		"Pembesaran KGB", "Riwayat Penyakit Lain", "Kontak Serumah TB",
		"Jumlah Jawaban Ya", "Hasil Skrining",
	}

	cols := []string{"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"}

	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Color: "FFFFFF", Size: 11},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"1E3A5F"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})

	rowStyleWhite, _ := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Vertical: "center"},
		Border: []excelize.Border{
			{Type: "bottom", Color: "E5E7EB", Style: 1},
		},
	})

	rowStyleGray, _ := f.NewStyle(&excelize.Style{
		Fill: excelize.Fill{Type: "pattern", Color: []string{"F9FAFB"}, Pattern: 1},
		Alignment: &excelize.Alignment{Vertical: "center"},
		Border: []excelize.Border{
			{Type: "bottom", Color: "E5E7EB", Style: 1},
		},
	})

	suspekStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Color: "B91C1C"},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"FEF2F2"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})

	rendahStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Color: "15803D"},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"F0FDF4"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})

	for i, h := range headers {
		cell := fmt.Sprintf("%s1", cols[i])
		f.SetCellValue(sheet, cell, h)
		f.SetCellStyle(sheet, cell, cell, headerStyle)
	}
	f.SetRowHeight(sheet, 1, 22)

	answerKeys := []string{"q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"}

	for i, screening := range screenings {
		row := i + 2
		rowStyle := rowStyleWhite
		if i%2 == 1 {
			rowStyle = rowStyleGray
		}

		var answersMap map[string]bool
		rawBytes, _ := screening.Answers.MarshalJSON()
		json.Unmarshal(rawBytes, &answersMap)

		yaTidak := func(key string) string {
			if answersMap[key] {
				return "Ya"
			}
			return "Tidak"
		}

		values := []interface{}{
			screening.CreatedAt.Format("02/01/2006"),
			screening.Name,
			screening.Phone,
		}
		for _, key := range answerKeys {
			values = append(values, yaTidak(key))
		}
		values = append(values, screening.Score)

		for j, val := range values {
			cell := fmt.Sprintf("%s%d", cols[j], row)
			f.SetCellValue(sheet, cell, val)
			f.SetCellStyle(sheet, cell, cell, rowStyle)
		}

		resultCell := fmt.Sprintf("N%d", row)
		if screening.Result == "suspek" {
			f.SetCellValue(sheet, resultCell, "Suspek TBC")
			f.SetCellStyle(sheet, resultCell, resultCell, suspekStyle)
		} else {
			f.SetCellValue(sheet, resultCell, "Risiko Rendah")
			f.SetCellStyle(sheet, resultCell, resultCell, rendahStyle)
		}

		f.SetRowHeight(sheet, row, 18)
	}

	widths := map[string]float64{
		"A": 16, "B": 22, "C": 16,
		"D": 18, "E": 20, "F": 16,
		"G": 18, "H": 24, "I": 14,
		"J": 18, "K": 22, "L": 18,
		"M": 16, "N": 16,
	}
	for col, width := range widths {
		f.SetColWidth(sheet, col, col, width)
	}

	return f, nil
}