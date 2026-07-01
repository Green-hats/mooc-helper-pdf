import * as React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useSetRecoilState } from "recoil";
import { messageState } from "@/features/message";
import { exportQuestionsToPdf } from "./exportPdf";

interface ExportButtonProps {
  title: string;
  mocPaperDto: MocPaperDto;
}

export default function ExportButton({ title, mocPaperDto }: ExportButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const setMessage = useSetRecoilState(messageState);

  const handleExport = async () => {
    setLoading(true);
    try {
      await exportQuestionsToPdf(mocPaperDto, title);
    } catch (e) {
      setMessage({ show: true, msg: String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" noWrap>
        {title}
      </Typography>
      <Tooltip title="导出PDF">
        <IconButton size="small" onClick={handleExport} disabled={loading}>
          {loading ? (
            <CircularProgress size={18} />
          ) : (
            <PictureAsPdfIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
