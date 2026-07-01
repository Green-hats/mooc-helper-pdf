import * as React from "react";
import TreeView from "@mui/lab/TreeView";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRounded from "@mui/icons-material/KeyboardArrowUpRounded";
import CustomTreeItem from "./CustomTreeItem";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { courseInfo } from "@/api";
import { selectedContentState, selectedCourseState } from "@/features/course";
import { messageState } from "@/features/message";

export default function ChapterTreeView() {
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [chapters, setChapters] = React.useState<Chapter[]>([]);

  const selectedCourse = useRecoilValue(selectedCourseState);
  const setSelectedContent = useSetRecoilState(selectedContentState);
  const setMessage = useSetRecoilState(messageState);

  React.useEffect(() => {
    const handleSelectedCourseChange = async (course: Course | null) => {
      if (course) {
        try {
          const { status, results } = await courseInfo(
            course.id,
            course.termPanel.id
          );
          if (status.code === 0) {
            setChapters(results.termDto.chapters);
            if (selectedCourse) {
              setExpanded([String(selectedCourse.id)]);
            }
          } else {
            setMessage({
              show: true,
              msg: status.message,
            });
          }
        } catch (error) {
          setMessage({
            show: true,
            msg: String(error),
          });
        }
      }
    };

    handleSelectedCourseChange(selectedCourse);
  }, [selectedCourse, setMessage]);

  return (
    <TreeView
      aria-label="folder"
      defaultCollapseIcon={
        <KeyboardArrowUpRounded sx={{ fontSize: 16, color: "primary.main" }} />
      }
      defaultExpandIcon={
        <KeyboardArrowDownRounded sx={{ fontSize: 16, color: "grey.600" }} />
      }
      defaultEndIcon={<div style={{ width: 24 }} />}
      sx={{ py: 1, overflowY: "auto" }}
      expanded={expanded}
      selected={selected}
      onNodeToggle={(_: React.SyntheticEvent<Element, Event>, nodeIds) =>
        setExpanded(nodeIds)
      }
      onNodeSelect={(
        _: React.SyntheticEvent<Element, Event>,
        nodeIds: string[]
      ) => setSelected(nodeIds)}
    >
      {selectedCourse && (
        <CustomTreeItem
          key={selectedCourse.id}
          nodeId={selectedCourse.id + ""}
          label={selectedCourse.name}
        >
          {chapters.map((chapter) => (
            <CustomTreeItem
              key={chapter.id}
              nodeId={String(chapter.id)}
              label={chapter.name}
            >
              {chapter.homeworks?.map((homework) => (
                <CustomTreeItem
                  key={`hw-${homework.contentId}`}
                  nodeId={`hw-${homework.contentId}`}
                  label={homework.name}
                  ContentProps={{
                    lastNestedChild: true,
                    onClick: () =>
                      setSelectedContent({
                        type: "homework",
                        name: homework.name,
                        contentId: homework.contentId,
                      }),
                  }}
                />
              ))}
              {chapter.quizs?.map((quiz) => (
                <CustomTreeItem
                  key={`qz-${quiz.contentId}`}
                  nodeId={`qz-${quiz.contentId}`}
                  label={quiz.name}
                  ContentProps={{
                    lastNestedChild: true,
                    onClick: () => {
                      setSelectedContent({
                        type: "quiz",
                        contentId: quiz.contentId,
                        name: quiz.name,
                      });
                    },
                  }}
                />
              ))}
              {chapter.exam?.objectTestVo && (
                <CustomTreeItem
                  key={`exam-obj-${chapter.exam.objectTestVo.id}`}
                  nodeId={`exam-obj-${chapter.exam.objectTestVo.id}`}
                  label={chapter.exam.objectTestVo.name}
                  ContentProps={{
                    lastNestedChild: true,
                    onClick: () =>
                      setSelectedContent({
                        type: "quiz",
                        contentId: chapter.exam.objectTestVo.id,
                        name: chapter.exam.objectTestVo.name,
                      }),
                  }}
                />
              )}
              {chapter.exam?.subjectTestVo && (
                <CustomTreeItem
                  key={`exam-sub-${chapter.exam.subjectTestVo.id}`}
                  nodeId={`exam-sub-${chapter.exam.subjectTestVo.id}`}
                  label={chapter.exam.subjectTestVo.name}
                  ContentProps={{
                    lastNestedChild: true,
                    onClick: () =>
                      setSelectedContent({
                        type: "homework",
                        contentId: chapter.exam.subjectTestVo.id,
                        name: chapter.exam.subjectTestVo.name,
                      }),
                  }}
                />
              )}
            </CustomTreeItem>
          ))}
        </CustomTreeItem>
      )}
    </TreeView>
  );
}
