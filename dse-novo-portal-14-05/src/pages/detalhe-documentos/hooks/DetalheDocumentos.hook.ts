import { useEffect, useState } from "react";
import { getReportsDetails, setFavoritesDocuments, setReportsDetails } from "src/redux/slices/relatorios";
import { useDispatch, useSelector } from "src/redux/store";
import moment from "moment";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { GetSession } from 'src/session';

const useDocumentsDetails = () => {

    const usuario = GetSession("@dse-usuario")
    const { isLoading } = useSelector((state) => state.report);
    const navigate = useNavigate()
    const theme = useTheme();
    const dispatch = useDispatch()
    const { reportsDetails } = useSelector((state: any) => state.report);
    const [filteredDetails, setFilteredDetails] = useState("");
    const [currentTab, setCurrentTab] = useState(0);
    const [orderBy, setOrderBy] = useState("");
    const [order, setOrder] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        dispatch(getReportsDetails(usuario.id));
    }, [])

    useEffect(() => {
        callSelectedTab(currentTab)
    }, [reportsDetails])

    const formatDays = (dueDate: string) => {
        const currentDate = moment();
        const dueDateMoment = moment(dueDate);
        const daysDifference = dueDateMoment.diff(currentDate, "days");

        return daysDifference;
    };

    const formatDaysToDueDate = (dueDate: string) => {
        const currentDate = moment();
        const dueDateMoment = moment(dueDate);
        const daysDifference = dueDateMoment.diff(currentDate, "days");

        if (daysDifference === 0) {
            return "Vence hoje";
        } else if (daysDifference === 1) {
            return "Vence amanhã";
        } else if (daysDifference > 1) {
            return `Faltam ${daysDifference} dias para vencer`;
        } else {
            return "Vencido";
        }
    };

    const colorAdvice = (daysDifference: number) => {
        if (daysDifference <= 5) {
            return theme.palette.error.main;
        } else if (daysDifference >= 6 && daysDifference <= 14) {
            return theme.palette.warning.main;
        } else {
            return theme.palette.grey[500];
        }
    };

    const callbackCard = (projeto_id: number, pasta_id: number, categoria_id: number) => {
        navigate(`/newdetalheprojeto/${projeto_id}?selectedPasteId=${pasta_id}&categorieId=${categoria_id}`);
      };
      

    const handleRequestSort = (event: any, property: any) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const createSortHandler = (property: any) => (event: any) => {
        handleRequestSort(event, property);
    };

    function stableSort(array: any[], comparator: (a: any, b: any) => number) {
        const stabilizedThis = array.map((el, index) => [el, index] as [any, number]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }

    function getComparator() {
        return (a: any, b: any) => {
            if (orderBy === "document") {
                return order === "desc" ? a.documento.localeCompare(b.documento) : b.documento.localeCompare(a.documento);
            }
            else if (orderBy === "project") {
                return order === "desc" ? a.projeto.localeCompare(b.projeto) : b.projeto.localeCompare(a.projeto);
            }
            else if (orderBy === "paste") {
                return order === "desc" ? a.pasta.localeCompare(b.pasta) : b.pasta.localeCompare(a.pasta);
            }
            else if (orderBy === "stats") {
                return order === "desc" ? formatDays(b.data_vencimento) - formatDays(a.data_vencimento) : formatDays(a.data_vencimento) - formatDays(b.data_vencimento);
            } else if (orderBy === "dueDate") {
                const dateA = moment(a.data_vencimento);
                const dateB = moment(b.data_vencimento);
                return order === "desc" ? dateB.diff(dateA) : dateA.diff(dateB);
            }

            return 0;
        };
    }

    const toggleFavoriteDetails = (id: any) => {
        const updatedDetails = reportsDetails.map((detalhe: any) => {
            if (detalhe.id === id) {
                dispatch(setFavoritesDocuments(detalhe.id, detalhe.isFavorite === 1 ? 0 : 1))
                return { ...detalhe, isFavorite: detalhe.isFavorite === 1 ? 0 : 1 };
            }
            return detalhe;
        });
        dispatch(setReportsDetails(updatedDetails));
    }

    const callSelectedTab = (value: any) => {
        let filteredReportsDetails = [];
        if (value === 0) {
            setFilteredDetails(reportsDetails)
        }
        if (value === 1) {
            filteredReportsDetails = reportsDetails.filter(
                (detalheRelatorio: any) => formatDays(detalheRelatorio.data_vencimento) < 0
            );
            setFilteredDetails(filteredReportsDetails);
        }
        if (value === 2) {
            filteredReportsDetails = reportsDetails.filter(
                (detalheRelatorio: any) => formatDays(detalheRelatorio.data_vencimento) > 0
            );
            setFilteredDetails(filteredReportsDetails);
        }
        if (value === 3) {
            filteredReportsDetails = reportsDetails.filter(
                (detalheRelatorio: any) => detalheRelatorio.isFavorite === 1
            );
            setFilteredDetails(filteredReportsDetails);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event: any) => {
        setSearchTerm(event.target.value);
    };

    const searchDetails = Array.isArray(filteredDetails) ? filteredDetails.filter(detalheDocumentos =>
        detalheDocumentos.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detalheDocumentos.pasta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detalheDocumentos.projeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDaysToDueDate(detalheDocumentos.data_vencimento).toLowerCase().includes(searchTerm.toLowerCase()) ||
        moment(detalheDocumentos.data_vencimento).format("DD/MM/YYYY").toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];



    return {
        isLoading,
        filteredDetails,
        setFilteredDetails,
        reportsDetails,
        toggleFavoriteDetails,
        callSelectedTab,
        currentTab,
        setCurrentTab,
        callbackCard,
        orderBy,
        setOrderBy,
        order,
        setOrder,
        createSortHandler,
        stableSort,
        getComparator,
        formatDays,
        formatDaysToDueDate,
        colorAdvice,
        searchTerm,
        handleSearchChange,
        searchDetails
    }
}

export default useDocumentsDetails