import React, { useEffect } from 'react';
import styles from './styles.module.scss';

type Props = {
  selected: boolean;
  tag: any;
  handleSelection: (tag: string, type?: string) => void;
};

function TagItem({ selected, tag, handleSelection }: Props) {
  const itemRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    if (selected) {
      itemRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [selected]);

  return (
    <div
      ref={itemRef}
      data-tag={tag.tag}
      className={
        selected ? [styles.item, styles.selectedTag].join(' ') : styles.item
      }
      role="button"
      tabIndex={0}
      onClick={() => handleSelection(tag.tag, tag.type)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSelection(tag.tag, tag.type);
        }
      }}
    >
      {tag.label}
    </div>
  );
}

export default TagItem;
