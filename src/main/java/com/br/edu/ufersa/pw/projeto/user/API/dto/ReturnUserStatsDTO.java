package com.br.edu.ufersa.pw.projeto.user.API.dto;

public class ReturnUserStatsDTO {

    private Long totalLidos;
    private Long lidosEsteAno;
    private Long totalNaBiblioteca;

    public ReturnUserStatsDTO() {}

    public ReturnUserStatsDTO(Long totalLidos, Long lidosEsteAno, Long totalNaBiblioteca) {
        this.totalLidos = totalLidos;
        this.lidosEsteAno = lidosEsteAno;
        this.totalNaBiblioteca = totalNaBiblioteca;
    }

    // --- GETTERS E SETTERS ---

    public Long getTotalLidos() {
        return totalLidos;
    }
    public void setTotalLidos(Long totalLidos) {
        this.totalLidos = totalLidos;
    }

    public Long getLidosEsteAno() {
        return lidosEsteAno;
    }
    public void setLidosEsteAno(Long lidosEsteAno) {
        this.lidosEsteAno = lidosEsteAno;
    }

    public Long getTotalNaBiblioteca() {
        return totalNaBiblioteca;
    }
    public void setTotalNaBiblioteca(Long totalNaBiblioteca) {
        this.totalNaBiblioteca = totalNaBiblioteca;
    }
}
