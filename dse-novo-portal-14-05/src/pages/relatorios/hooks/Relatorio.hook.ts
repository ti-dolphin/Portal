import { useEffect, useState } from "react"
import { useNavigate } from "react-router";
import { getReports, setReports } from "src/redux/slices/relatorios";
import { useDispatch, useSelector } from "src/redux/store";

const useRelatorio = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [currentTab, setCurrentTab] = useState(0);
    const { isLoading } = useSelector((state) => state.report);
    const { reports, favoriteReports } = useSelector((state: any) => state.report);
    const [filteredReports, setFilteredReports] = useState(""); 
    
    useEffect(() => {
        dispatch(getReports());
    }, []);

    const callbackSelectedTab = (value: any) => {
        if (value === 0) {
            dispatch(getReports());
        } else {
            const favoriteReports = reports.filter((relatorio: any) => relatorio.isFavorite === true);
            dispatch(setReports(favoriteReports));
        }
    };

    const toggleFavorite = (id: any) => {
        const updatedRelatorios = reports.map((relatorio: any) => {
            if (relatorio.id === id) {
                return { ...relatorio, isFavorite: !relatorio.isFavorite };
            }
            return relatorio;
        });
        dispatch(setReports(updatedRelatorios));
        setFilteredReports(updatedRelatorios); 
    };

    const callbackCard = () => {
        navigate(`/detalhe-documentos`);
    };

    return {
        search,
        isLoading,
        reports,
        currentTab,
        favoriteReports,
        filteredReports,
        setSearch,
        callbackSelectedTab,
        callbackCard,
        toggleFavorite,
        setCurrentTab,
        setFilteredReports,
    }
}

export default useRelatorio;
